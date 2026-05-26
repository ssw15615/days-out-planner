import { db, storage } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export async function uploadTripPhoto(file, userId) {
  const storageRef = ref(storage, `trips/${userId}/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytesResumable(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}

export async function addTrip(trip) {
  const result = await addDoc(collection(db, 'trips'), {
    ...trip,
    createdAt: serverTimestamp(),
  });
  return { id: result.id, ...trip };
}

export async function getUserTrips(userId, isAdmin) {
  const tripsRef = collection(db, 'trips');
  const q = isAdmin
    ? query(tripsRef, orderBy('date'))
    : query(tripsRef, where('userId', '==', userId), orderBy('date'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getTripById(id) {
  const docRef = doc(db, 'trips', id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function updateTrip(id, updates) {
  const docRef = doc(db, 'trips', id);
  await updateDoc(docRef, updates);
  return { id, ...updates };
}

export async function deleteTrip(id) {
  const docRef = doc(db, 'trips', id);
  await deleteDoc(docRef);
}

export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllTrips() {
  const snapshot = await getDocs(collection(db, 'trips'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateUserRole(userId, role) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { role });
}

export async function deleteUserAndTrips(userId) {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
  const tripsQ = query(collection(db, 'trips'), where('userId', '==', userId));
  const tripSnapshot = await getDocs(tripsQ);
  await Promise.all(tripSnapshot.docs.map(t => deleteDoc(doc(db, 'trips', t.id))));
}
