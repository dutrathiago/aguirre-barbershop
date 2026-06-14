import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserRole = 'client' | 'barber' | 'dev';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: UserRole;
  createdAt?: any;
}

export async function registerClient(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<AppUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  await updateProfile(user, { displayName: name });

  const appUser: AppUser = {
    uid: user.uid,
    name,
    email,
    phone,
    role: 'client',
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', user.uid), appUser);
  return appUser;
}

export async function loginUser(email: string, password: string): Promise<AppUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', credential.user.uid));

  if (!userDoc.exists()) {
    throw new Error('Usuário não encontrado no banco de dados.');
  }

  return userDoc.data() as AppUser;
}

export async function loginAdmin(email: string, password: string): Promise<AppUser> {
  const appUser = await loginUser(email, password);

  if (appUser.role !== 'barber' && appUser.role !== 'dev') {
    await signOut(auth);
    throw new Error('Acesso não autorizado. Esta conta não tem permissão de administrador.');
  }

  return appUser;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return userDoc.data() as AppUser;
}

export async function updateUserProfile(uid: string, data: Partial<AppUser>): Promise<void> {
  await setDoc(doc(db, 'users', uid), data, { merge: true });

  if (data.name && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: data.name });
  }
}
