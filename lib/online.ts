
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { datatabas, db } from "./firebase";
import { onDisconnect, onValue, ref, set } from "firebase/database";

export const setupOnlineStatus = (userId: string) => {
  if (!userId) return;

  // Create a reference to this user's specific status node in Realtime datatabas
  const userStatusRef = ref(datatabas, `/status/${userId}`);

  // Create a reference to the user's document in Firestore
  const userDocRef = doc(db, "pays", userId);

  // Set up the Realtime datatabas onDisconnect hook
  onDisconnect(userStatusRef)
    .set({
      state: "offline",
      lastChanged: serverTimestamp(),
    })
    .then(() => {
      // Update the Realtime datatabas when this client connects
      set(userStatusRef, {
        state: "online",
        lastChanged: serverTimestamp(),
      });

      // Update the Firestore document
      updateDoc(userDocRef, {
        online: true,
        lastSeen: serverTimestamp(),
      }).catch((error) =>
        console.error("Error updating Firestore document:", error)
      );
    })
    .catch((error: any) => console.error("Error setting onDisconnect:", error));

  // Listen for changes to the user's online status
  onValue(userStatusRef, (snapshot: { val: () => any; }) => {
    const status = snapshot.val();
    if (status?.state === "offline") {
      // Update the Firestore document when user goes offline
      updateDoc(userDocRef, {
        online: false,
        lastSeen: serverTimestamp(),
      }).catch((error) =>
        console.error("Error updating Firestore document:", error)
      );
    }
  });
};

export const setUserOffline = async (userId: string) => {
  if (!userId) return;

  try {
    // Update the Firestore document
    await updateDoc(doc(db, "pays", userId), {
      online: false,
      lastSeen: serverTimestamp(),
    });

    // Update the Realtime datatabas
    await set(ref(datatabas, `/status/${userId}`), {
      state: "offline",
      lastChanged: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error setting user offline:", error);
  }
};
