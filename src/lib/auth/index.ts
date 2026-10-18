import "server-only";

export { AuthError, DomainError } from "./errors";
export {
  ensureLocalUser,
  getViewer,
  isAdmin,
  requireAdmin,
  requireAdminPage,
  requireUser,
  requireUserPage,
  type Viewer,
} from "./viewer";
