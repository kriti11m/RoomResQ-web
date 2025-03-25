import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './config';

export const submitMaintenanceRequest = async (requestData) => {
  if (!auth.currentUser) throw new Error('No user logged in');

  try {
    let proofUrl = null;
    if (requestData.proof) {
      const storageRef = ref(storage, `proofs/${auth.currentUser.uid}/${requestData.proof.name}`);
      await uploadBytes(storageRef, requestData.proof);
      proofUrl = await getDownloadURL(storageRef);
    }

    const request = {
      ...requestData,
      proofUrl,
      userId: auth.currentUser.uid,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'maintenance_requests'), request);
    return { id: docRef.id, ...request };
  } catch (error) {
    throw error;
  }
};

export const getUserRequests = async () => {
  if (!auth.currentUser) throw new Error('No user logged in');

  try {
    const q = query(
      collection(db, 'maintenance_requests'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    throw error;
  }
}; 