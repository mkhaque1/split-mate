import { doc, updateDoc } from "firebase/firestore";
import firestore from "../../../lib/firebase";


export const UpdateUserData = async ({
UserData,Email
}) => {
  try {

  
    const docRef = doc(firestore, "Users", Email);
    await updateDoc(docRef, UserData);
    console.log(`User data updated in ${"Users"} collection with ID: ${Email}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};
