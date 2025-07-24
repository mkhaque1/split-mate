import { doc, setDoc } from "firebase/firestore";
import firestore from "../../../lib/firebase";

import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Registers user data and stores it in Firestore and AsyncStorage
 * @param {Object} params
 * @param {string} params.Name
 * @param {string} params.Email
 * @param {string} params.Password
 * @param {string} params.Plan
 * @param {string} params.Deviceid
 * @param {(userData: object) => void} [params.setUserData] - Optional, for setting user data in context
 */
export const RegisteringUserData = async ({
  Name,
  Email,
  Password,
  Plan,
  Deviceid,
  setUserData, // passed from inside the component
}) => {
  try {
    const userData = {
      Email,
      Password,
      Name,
      createdAt: new Date().toISOString(),
      Plan,
      EmailVerified: false,
      Deviceid,
    };

    const docRef = doc(firestore, "Users", Email);
    await AsyncStorage.setItem("UserData", JSON.stringify(userData));
    if (typeof setUserData === "function") {
      setUserData(userData);
    }

    await setDoc(docRef, userData);

    console.log(`✅ User data saved to 'Users' collection with ID: ${Email}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error saving user data:", error);
    throw error;
  }
};
