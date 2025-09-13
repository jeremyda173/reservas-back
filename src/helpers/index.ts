import { firestore } from "firebase-admin";

export async function getNextTableId(): Promise<number> {
  const counterRef = firestore().collection("counters").doc("tables");

  return firestore().runTransaction(async (tx) => {
    const counterDoc = await tx.get(counterRef);
    let newId = 1;
    if (counterDoc.exists) {
      const data = counterDoc.data() as { lastId?: number };
      newId = (data?.lastId || 0) + 1;
    }
    tx.set(counterRef, { lastId: newId }, { merge: true });
    return newId;
  });
}
