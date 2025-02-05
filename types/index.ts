export type RootStackParamList = {
  WELCOME_SCREEN: undefined
  INFO_SCREEN: undefined
  CONTINUE_SCREEN: undefined
  PLAYER_SCREEN: { oldPlan: number; isStartGame: boolean }
  PLAYER_EDIT_SCREEN: {
    fullName: string
    avatar: string
    email: string
    intention: string
    oldPlan: number
    isStartGame: boolean
  }
  GAME_SCREEN: undefined
  PLANS_SCREEN: undefined
  PLAN_SCREEN: { key: string; currentPlan: number }
  REPORTS_SCREEN: { report: Report }
  REPORT_SCREEN: { report: Report }
  UI_KIT_SCREEN: undefined
  SEED_SCREEN: undefined
}

export interface GemT {
  id: string
  plan: number
  avatar: string
}
export interface Player {
  id: string
  fullName: string
  plan: number
  avatar: string
  intention: string
  previousPlan?: number
  isStart?: boolean
  isFinished?: boolean
  consecutiveSixes?: number
  positionBeforeThreeSixes?: number
  message?: string
}
export interface ProfileData {
  createPlayer: Player
}

export interface GameBoardProps {
  players: Player[]
}

export interface Comment {
  id: string
  reportId: string
  content: string
  avatar: string
  fullName: string
  plan: number
  timestamp: string
}

export interface UserActions {
  handleProfile: () => void
  handleAdminMenu: () => void
  handleShareLink: () => void
  handleLike: () => void
  handleComment: () => void
}

export interface Report {
  id: string
  actor: string
  fullName: string
  avatar: string
  text: string
  content: string
  reportId: string
  comments: Comment[]
  onPress: () => void
  plan: number
  accept: boolean
  isAdmin: boolean
  isLikedByCurrentUser: boolean
  likes: string
  commentCount: number
  likeCount: number
  timestamp: string
  handleProfile?: () => void
}

export interface MessageAIT {
  systemMessage: string
  message: string
  planText: string
}

export interface HandleCommentAiParamsT {
  curItem: Report | undefined
  systemMessage: string
  message: string
  planText?: string
}

export interface Like {
  id: string
  report: Report
  player: Player
  createdAt: string
}

export interface PlayerFullInput {
  account: string
  fullName: string
  avatar: string
  intention: string
  email: string
  plan: number
  previousPlan: number
  isStart: boolean
  isFinished: boolean
  consecutiveSixes: number
  positionBeforeThreeSixes: number
}

enum Action {
  Created,
  Updated,
  Deleted,
}
export interface PlayerInput {
  fullName: string
  avatar: string | null
  intention: string
  action: Action
}
