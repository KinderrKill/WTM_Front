export interface SendCookieData {
  username: string;
  cookie: string;
}

export interface Player {
  uuid: string;
  username: string;
  readyToPlay: boolean;
}

export interface PlayerChoice {
  uuid: string;
  round: number;
  choice: string | undefined;
}

export interface GotoGameData {
  joiner: Player;
  game: GameType;
}

export interface GameType {
  id: string;
  private: boolean;
  phase: PhaseType;
  owner: Player;
  players: Player[];
  actualRound: number;
  playersChoices: PlayerChoice[];
  likedMemes: LikedMeme[];
}

export interface UpdateGame {
  game: GameType;
}

export interface SocketUpdatePlayerState {
  playerUUID: string;
  launchCountdown: boolean;
}

export interface Gif {
  id: string;
  images: {
    original: {
      url: string;
    };
  };
  slug: string;
}

export interface LikedMeme {
  authorUUID: string;
  round: number;
  choice: string;
}

export interface GameResult {
  round: number;
  author: {
    uuid: string;
    username: string;
  };
  gifUrl: string;
  totalPoints: number;
  likes: number;
}

export const PHASE = {
  PENDING: 'pending',
  DRAFT: 'draft',
  VOTE: 'vote',
  RESULT: 'result',
  END: 'end',
} as const;

export type PhaseType = (typeof PHASE)[keyof typeof PHASE];
