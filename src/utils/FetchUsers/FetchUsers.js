import { collection, getDocs } from "firebase/firestore";
import firestore from "../../../lib/firebase";


export const fetchAllUsers = async () => {
  try {
    const usersRef = collection(firestore, "Users");
    const querySnapshot = await getDocs(usersRef);

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
