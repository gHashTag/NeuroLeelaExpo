export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Bytes: { input: any; output: any; }
  Int8: { input: any; output: any; }
};

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type CommentAction = {
  __typename?: 'CommentAction';
  action: Scalars['Int']['output'];
  actor: Scalars['Bytes']['output'];
  blockNumber: Scalars['BigInt']['output'];
  blockTimestamp: Scalars['BigInt']['output'];
  commentId: Scalars['BigInt']['output'];
  content: Scalars['String']['output'];
  id: Scalars['Bytes']['output'];
  reportId: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Bytes']['output'];
};

export type CommentAction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  action?: InputMaybe<Scalars['Int']['input']>;
  action_gt?: InputMaybe<Scalars['Int']['input']>;
  action_gte?: InputMaybe<Scalars['Int']['input']>;
  action_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  action_lt?: InputMaybe<Scalars['Int']['input']>;
  action_lte?: InputMaybe<Scalars['Int']['input']>;
  action_not?: InputMaybe<Scalars['Int']['input']>;
  action_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  actor?: InputMaybe<Scalars['Bytes']['input']>;
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>;
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>;
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>;
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>;
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>;
  actor_not?: InputMaybe<Scalars['Bytes']['input']>;
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<CommentAction_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  commentId?: InputMaybe<Scalars['BigInt']['input']>;
  commentId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  commentId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  commentId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  commentId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  commentId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  commentId_not?: InputMaybe<Scalars['BigInt']['input']>;
  commentId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  content?: InputMaybe<Scalars['String']['input']>;
  content_contains?: InputMaybe<Scalars['String']['input']>;
  content_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  content_ends_with?: InputMaybe<Scalars['String']['input']>;
  content_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  content_gt?: InputMaybe<Scalars['String']['input']>;
  content_gte?: InputMaybe<Scalars['String']['input']>;
  content_in?: InputMaybe<Array<Scalars['String']['input']>>;
  content_lt?: InputMaybe<Scalars['String']['input']>;
  content_lte?: InputMaybe<Scalars['String']['input']>;
  content_not?: InputMaybe<Scalars['String']['input']>;
  content_not_contains?: InputMaybe<Scalars['String']['input']>;
  content_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  content_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  content_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  content_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  content_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  content_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  content_starts_with?: InputMaybe<Scalars['String']['input']>;
  content_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<CommentAction_Filter>>>;
  reportId?: InputMaybe<Scalars['BigInt']['input']>;
  reportId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  reportId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  reportId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  reportId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  reportId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  reportId_not?: InputMaybe<Scalars['BigInt']['input']>;
  reportId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum CommentAction_OrderBy {
  Action = 'action',
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  BlockTimestamp = 'blockTimestamp',
  CommentId = 'commentId',
  Content = 'content',
  Id = 'id',
  ReportId = 'reportId',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash'
}

export type DiceRolled = {
  __typename?: 'DiceRolled';
  blockNumber: Scalars['BigInt']['output'];
  blockTimestamp: Scalars['BigInt']['output'];
  currentPlan: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  rolled: Scalars['Int']['output'];
  roller: Scalars['Bytes']['output'];
  transactionHash: Scalars['Bytes']['output'];
};

export type DiceRolled_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DiceRolled_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  currentPlan?: InputMaybe<Scalars['BigInt']['input']>;
  currentPlan_gt?: InputMaybe<Scalars['BigInt']['input']>;
  currentPlan_gte?: InputMaybe<Scalars['BigInt']['input']>;
  currentPlan_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  currentPlan_lt?: InputMaybe<Scalars['BigInt']['input']>;
  currentPlan_lte?: InputMaybe<Scalars['BigInt']['input']>;
  currentPlan_not?: InputMaybe<Scalars['BigInt']['input']>;
  currentPlan_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<DiceRolled_Filter>>>;
  rolled?: InputMaybe<Scalars['Int']['input']>;
  rolled_gt?: InputMaybe<Scalars['Int']['input']>;
  rolled_gte?: InputMaybe<Scalars['Int']['input']>;
  rolled_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  rolled_lt?: InputMaybe<Scalars['Int']['input']>;
  rolled_lte?: InputMaybe<Scalars['Int']['input']>;
  rolled_not?: InputMaybe<Scalars['Int']['input']>;
  rolled_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  roller?: InputMaybe<Scalars['Bytes']['input']>;
  roller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  roller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  roller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  roller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  roller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  roller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  roller_not?: InputMaybe<Scalars['Bytes']['input']>;
  roller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  roller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum DiceRolled_OrderBy {
  BlockNumber = 'blockNumber',
  BlockTimestamp = 'blockTimestamp',
  CurrentPlan = 'currentPlan',
  Id = 'id',
  Rolled = 'rolled',
  Roller = 'roller',
  TransactionHash = 'transactionHash'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  commentAction?: Maybe<CommentAction>;
  commentActions: Array<CommentAction>;
  diceRolled?: Maybe<DiceRolled>;
  diceRolleds: Array<DiceRolled>;
  reportAction?: Maybe<ReportAction>;
  reportActions: Array<ReportAction>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryCommentActionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCommentActionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CommentAction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CommentAction_Filter>;
};


export type QueryDiceRolledArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDiceRolledsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DiceRolled_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DiceRolled_Filter>;
};


export type QueryReportActionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryReportActionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ReportAction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ReportAction_Filter>;
};

export type ReportAction = {
  __typename?: 'ReportAction';
  action: Scalars['Int']['output'];
  actor: Scalars['Bytes']['output'];
  blockNumber: Scalars['BigInt']['output'];
  blockTimestamp: Scalars['BigInt']['output'];
  content: Scalars['String']['output'];
  id: Scalars['Bytes']['output'];
  plan: Scalars['BigInt']['output'];
  reportId: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Bytes']['output'];
};

export type ReportAction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  action?: InputMaybe<Scalars['Int']['input']>;
  action_gt?: InputMaybe<Scalars['Int']['input']>;
  action_gte?: InputMaybe<Scalars['Int']['input']>;
  action_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  action_lt?: InputMaybe<Scalars['Int']['input']>;
  action_lte?: InputMaybe<Scalars['Int']['input']>;
  action_not?: InputMaybe<Scalars['Int']['input']>;
  action_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  actor?: InputMaybe<Scalars['Bytes']['input']>;
  actor_contains?: InputMaybe<Scalars['Bytes']['input']>;
  actor_gt?: InputMaybe<Scalars['Bytes']['input']>;
  actor_gte?: InputMaybe<Scalars['Bytes']['input']>;
  actor_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  actor_lt?: InputMaybe<Scalars['Bytes']['input']>;
  actor_lte?: InputMaybe<Scalars['Bytes']['input']>;
  actor_not?: InputMaybe<Scalars['Bytes']['input']>;
  actor_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  actor_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<ReportAction_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  content?: InputMaybe<Scalars['String']['input']>;
  content_contains?: InputMaybe<Scalars['String']['input']>;
  content_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  content_ends_with?: InputMaybe<Scalars['String']['input']>;
  content_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  content_gt?: InputMaybe<Scalars['String']['input']>;
  content_gte?: InputMaybe<Scalars['String']['input']>;
  content_in?: InputMaybe<Array<Scalars['String']['input']>>;
  content_lt?: InputMaybe<Scalars['String']['input']>;
  content_lte?: InputMaybe<Scalars['String']['input']>;
  content_not?: InputMaybe<Scalars['String']['input']>;
  content_not_contains?: InputMaybe<Scalars['String']['input']>;
  content_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  content_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  content_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  content_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  content_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  content_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  content_starts_with?: InputMaybe<Scalars['String']['input']>;
  content_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<ReportAction_Filter>>>;
  plan?: InputMaybe<Scalars['BigInt']['input']>;
  plan_gt?: InputMaybe<Scalars['BigInt']['input']>;
  plan_gte?: InputMaybe<Scalars['BigInt']['input']>;
  plan_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  plan_lt?: InputMaybe<Scalars['BigInt']['input']>;
  plan_lte?: InputMaybe<Scalars['BigInt']['input']>;
  plan_not?: InputMaybe<Scalars['BigInt']['input']>;
  plan_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  reportId?: InputMaybe<Scalars['BigInt']['input']>;
  reportId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  reportId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  reportId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  reportId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  reportId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  reportId_not?: InputMaybe<Scalars['BigInt']['input']>;
  reportId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum ReportAction_OrderBy {
  Action = 'action',
  Actor = 'actor',
  BlockNumber = 'blockNumber',
  BlockTimestamp = 'blockTimestamp',
  Content = 'content',
  Id = 'id',
  Plan = 'plan',
  ReportId = 'reportId',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash'
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  commentAction?: Maybe<CommentAction>;
  commentActions: Array<CommentAction>;
  diceRolled?: Maybe<DiceRolled>;
  diceRolleds: Array<DiceRolled>;
  reportAction?: Maybe<ReportAction>;
  reportActions: Array<ReportAction>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionCommentActionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionCommentActionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CommentAction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CommentAction_Filter>;
};


export type SubscriptionDiceRolledArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDiceRolledsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DiceRolled_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DiceRolled_Filter>;
};


export type SubscriptionReportActionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionReportActionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ReportAction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ReportAction_Filter>;
};

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}
