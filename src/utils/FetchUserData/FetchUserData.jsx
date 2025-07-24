import { doc, getDoc } from "firebase/firestore";
import firestore from "../../../lib/firebase";
export const fetchmyuser = async ({ Email }) => {
  console.log("Fetching user data for Email:", Email);
  try {
    const userDocRef = doc(firestore, "Users", Email);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const user = { id: docSnap.id, ...docSnap.data() };
      console.log("Fetched user:", user);
      return user;
    } else {
      console.log("No user found with that email.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};
