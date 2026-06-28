import { Account } from './Account';
import { Jwks } from './Jwks';
import { Session } from './Session';
import { User } from './User';
import { Verification } from './Verification';

/** Entity classes under `entities/auth/` — update this list after `auth:generate`. */
export const authEntities = [Account, Jwks, Session, User, Verification];

export { Account, Jwks, Session, User, Verification };
