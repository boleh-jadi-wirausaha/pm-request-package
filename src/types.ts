export interface SaasClientConfig {
  baseUrl?: string;
  organizationId: string;
  guestShareUrl?: string;
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

export type FormFieldType = "Text" | "MultipleChoice" | "Checkbox" | "Toggle" | "Date";

export interface WorkspaceFormFieldDTO {
  id: string;
  label: string;
  type: FormFieldType;
  options?: string[];
  isRequired: boolean;
  order: number;
  workspaceId?: string;
}

export interface TicketFieldValueInputDTO {
  workspaceFormFieldId: string;
  values: string[];
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
  // TODO: unconfirmed whether the authenticated `by-organization` workspace list embeds this
  // (doc only documents FormFields on the anonymous request-form problem-definitions DTO).
  formFields?: WorkspaceFormFieldDTO[];
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
  fieldValues?: TicketFieldValueInputDTO[];
}

export type NotificationType =
  | "TicketAssigned"
  | "TicketStateChanged"
  | "TicketApprovalRequested"
  | "TicketApprovalDecided"
  | "TicketCollaboratorAdded"
  | "TicketMentioned"
  | "SubtaskAssigned"
  | "SubtaskStateChanged"
  | "SubtaskApprovalRequested"
  | "SubtaskApprovalDecided"
  | "SubtaskMentioned"
  | "MomInvited"
  | "TicketChatted"
  | "GroupChatMentioned"
  | "TicketCustomerMessage"
  | "TicketCustomerChatted";

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
