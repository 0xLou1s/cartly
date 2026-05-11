import { Injectable } from '@nestjs/common'
import { createHmac, timingSafeEqual } from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { GoogleAuthSignedStateSchema, GoogleAuthSignedStateType, GoogleAuthStateType } from 'src/routes/auth/auth.model'
import envConfig from 'src/shared/env.config'
import { HashingService } from 'src/shared/services/hashing.service'
import { v4 as uuidv4 } from 'uuid'
import { AuthRepository } from './auth.repo'
import { AuthService } from './auth.service'
import { RolesService } from './roles.service'
import { GoogleUserInfoError, InvalidStateError, MissingStateError, StateExpiredError } from './error.model'

const STATE_TTL_MS = 10 * 60 * 1000

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authService: AuthService,
  ) {
    this.oauth2Client = this.createOAuth2Client()
  }

  private createOAuth2Client(): OAuth2Client {
    return new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    )
  }

  getAuthorizationUrl({ userAgent, ip }: GoogleAuthStateType) {
    const scope = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
    const state = this.signState({ userAgent, ip, iat: Date.now() })
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      include_granted_scopes: true,
      state,
    })
    return { url }
  }

  async googleCallback({ code, state }: { code: string; state: string }) {
    const { userAgent, ip } = this.verifyState(state)

    // Per-request client: setCredentials mutates state, shared instance would race across concurrent callbacks
    const client = this.createOAuth2Client()
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    const oauth2 = google.oauth2({ auth: client, version: 'v2' })
    const { data } = await oauth2.userinfo.get()
    if (!data.email) {
      throw GoogleUserInfoError
    }

    let user = await this.authRepository.findUniqueUserIncludeRole({ email: data.email })
    if (!user) {
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(uuidv4())
      user = await this.authRepository.createUserInclueRole({
        email: data.email,
        name: data.name ?? '',
        password: hashedPassword,
        roleId: clientRoleId,
        phoneNumber: '',
        avatar: data.picture ?? null,
      })
    }
    const device = await this.authRepository.createDevice({ userId: user.id, userAgent, ip })
    return this.authService.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    })
  }

  private signState(payload: object): string {
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const sig = createHmac('sha256', envConfig.SECRET_API_KEY).update(data).digest('base64url')
    return `${data}.${sig}`
  }

  verifyState(state: string): GoogleAuthSignedStateType {
    if (!state) throw MissingStateError
    const [data, sig] = state.split('.')
    if (!data || !sig) throw InvalidStateError
    const expected = createHmac('sha256', envConfig.SECRET_API_KEY).update(data).digest('base64url')
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw InvalidStateError
    const parsed = GoogleAuthSignedStateSchema.parse(JSON.parse(Buffer.from(data, 'base64url').toString('utf8')))
    if (Date.now() - parsed.iat > STATE_TTL_MS) throw StateExpiredError
    return parsed
  }
}
