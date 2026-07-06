export interface SaasClientConfig {
  baseUrl?: string;
  organizationId: string;
}

export interface ApiResult<T> {
  data?: T;
  error?: { message: string; code?: string | number };
}

export interface SignInRequestDTO {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
  refreshToken: string;
  refreshTokenExpiresIn: string;
  mfaRequired?: boolean;
  preAuthToken?: string;
}

export interface UserDTO {
  id: string;
  fullName: string;
  initial?: string;
  email: string;
  accessToken: string;
  onboardingDone: boolean;
  profilePicture?: string;
}

export interface ProblemDefinition {
  id: string;
  problemDefinitionText: string;
  workspaceId: string;
}

export interface TicketState {
  id: string;
  stateName: string;
  workspaceId?: string | null;
  order?: number;
  approverUserRoleId?: string | null;
}

export interface TicketUrgency {
  id: string;
  urgencyName: string;
  urgencyWeight: number;
  deadlineInDays: number;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface Workspace {
  id: string;
  workspaceName: string;
  workspaceDescription?: string;
  type: "Request" | string;
  organizationId?: string;
  ongoingTicketCount?: number;
  ticketTitlePlaceholder?: string;
  ticketTitleRegex?: string;
  problemDefinitions?: ProblemDefinition[];
  ticketStates?: TicketState[];
}

export interface Ticket {
  id: string;
  description: string;
  problemDefinitionId?: string;
  ticketUrgencyId?: string;
  handlerId?: string;
  deadline?: string;
  ticketIdentifier?: string;
  ticketState?: TicketState;
  ticketUrgency?: TicketUrgency;
  createdDate?: string;
}

export interface CreateRequestWorkspaceTicketDTO {
  workspaceId: string;
  description: string;
  problemDefinitionId: string;
  ticketUrgencyId?: string;
  handlerId?: string;
  deadline?: string;
  photos?: File[];
}

export interface TicketCustomerChat {
  id: string;
  message: string;
  createdDate: string;
  authorName: string;
  isCustomer: boolean;
  imageUrl?: string;
  hasImage?: boolean;
  replyToId?: string;
  replyToMessage?: string;
  replyToSenderName?: string;
}
