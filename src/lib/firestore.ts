import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Barber {
  id?: string;
  name: string;
  phone: string; // WhatsApp number e.g. "5511999999999"
  photoURL?: string;
  bio?: string;
  rating?: number;
  address: string;
  isActive: boolean;
  createdAt?: any;
}

export interface Service {
  id?: string;
  barberId: string;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number; // BRL
  photoURL?: string;
}

export interface TimeSlot {
  time: string; // "09:00"
  available: boolean;
  appointmentId?: string;
  clientName?: string;
}

export interface Appointment {
  id?: string;
  clientId: string;
  clientName: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string; // "2024-06-14"
  time: string; // "09:00"
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt?: any;
}

export interface ChatMessage {
  id?: string;
  from: string; // uid
  text: string;
  timestamp: any;
}

// ─── Barbers ──────────────────────────────────────────────────────────────────

export async function getBarbers(): Promise<Barber[]> {
  const q = query(collection(db, 'barbers'), where('isActive', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Barber));
}

export async function getBarber(barberId: string): Promise<Barber | null> {
  const docRef = doc(db, 'barbers', barberId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Barber;
}

export async function createBarber(barber: Omit<Barber, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'barbers'), {
    ...barber,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBarber(barberId: string, data: Partial<Barber>): Promise<void> {
  await updateDoc(doc(db, 'barbers', barberId), data);
}

export async function deleteBarber(barberId: string): Promise<void> {
  await updateDoc(doc(db, 'barbers', barberId), { isActive: false });
}

// ─── Services ─────────────────────────────────────────────────────────────────

export async function getServices(barberId?: string): Promise<Service[]> {
  const q = barberId
    ? query(collection(db, 'services'), where('barberId', '==', barberId))
    : query(collection(db, 'services'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
}

export async function createService(service: Omit<Service, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'services'), service);
  return ref.id;
}

export async function updateService(serviceId: string, data: Partial<Service>): Promise<void> {
  await updateDoc(doc(db, 'services', serviceId), data);
}

export async function deleteService(serviceId: string): Promise<void> {
  await deleteDoc(doc(db, 'services', serviceId));
}

// ─── Availability / Slots ─────────────────────────────────────────────────────

export async function getAvailableSlots(barberId: string, date: string): Promise<TimeSlot[]> {
  const docRef = doc(db, 'availability', barberId, 'slots', date);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return [];
  const data = snap.data() as Record<string, TimeSlot>;
  return Object.entries(data)
    .map(([time, slot]) => ({ ...slot, time }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

export async function setSlot(
  barberId: string,
  date: string,
  time: string,
  slot: Partial<TimeSlot>
): Promise<void> {
  const docRef = doc(db, 'availability', barberId, 'slots', date);
  await setDoc(docRef, { [time]: slot }, { merge: true });
}

export function subscribeToSlots(
  barberId: string,
  date: string,
  callback: (slots: TimeSlot[]) => void
) {
  const docRef = doc(db, 'availability', barberId, 'slots', date);
  return onSnapshot(docRef, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const data = snap.data() as Record<string, TimeSlot>;
    const slots = Object.entries(data)
      .map(([time, slot]) => ({ ...slot, time }))
      .sort((a, b) => a.time.localeCompare(b.time));
    callback(slots);
  });
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function createAppointment(appointment: Omit<Appointment, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'appointments'), {
    ...appointment,
    createdAt: serverTimestamp(),
  });

  // Mark slot as occupied
  await setSlot(appointment.barberId, appointment.date, appointment.time, {
    available: false,
    appointmentId: ref.id,
    clientName: appointment.clientName,
  });

  return ref.id;
}

export async function getAppointmentsByClient(clientId: string): Promise<Appointment[]> {
  const q = query(
    collection(db, 'appointments'),
    where('clientId', '==', clientId),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
}

export async function getAppointmentsByBarber(barberId: string, date?: string): Promise<Appointment[]> {
  const constraints: any[] = [where('barberId', '==', barberId)];
  if (date) constraints.push(where('date', '==', date));
  constraints.push(orderBy('time', 'asc'));

  const q = query(collection(db, 'appointments'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
}

export function subscribeToAppointments(
  barberId: string,
  date: string,
  callback: (appointments: Appointment[]) => void
) {
  const q = query(
    collection(db, 'appointments'),
    where('barberId', '==', barberId),
    where('date', '==', date),
    orderBy('time', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
  });
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: Appointment['status'],
  appointment?: Appointment
): Promise<void> {
  await updateDoc(doc(db, 'appointments', appointmentId), { status });

  // If cancelled, free the slot
  if (status === 'cancelled' && appointment) {
    await setSlot(appointment.barberId, appointment.date, appointment.time, {
      available: true,
      appointmentId: undefined,
      clientName: undefined,
    });
  }
}

// ─── Chat / Messages ──────────────────────────────────────────────────────────

export function subscribeToMessages(
  appointmentId: string,
  callback: (messages: ChatMessage[]) => void
) {
  const q = query(
    collection(db, 'messages', appointmentId, 'messages'),
    orderBy('timestamp', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
  });
}

export async function sendMessage(appointmentId: string, from: string, text: string): Promise<void> {
  await addDoc(collection(db, 'messages', appointmentId, 'messages'), {
    from,
    text,
    timestamp: serverTimestamp(),
  });
}
