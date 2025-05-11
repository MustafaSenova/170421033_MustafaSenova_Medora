import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserHealthProfile, UserType } from "@/types";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";


const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType>(null);
    const router = useRouter();
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser?.uid,
                    email: firebaseUser?.email,
                    firstName: firebaseUser?.displayName,
                    lastName: firebaseUser?.displayName
                });
                updateUserData(firebaseUser.uid).then(() => {
                    // Check if user has health profile data after updating user data
                    const docRef = doc(firestore, "patients", firebaseUser.uid);
                    getDoc(docRef).then((docSnap) => {
                        if (docSnap.exists()) {
                            const userData = docSnap.data();
                            if (!userData.healthProfile) {
                                // Redirect to onboarding modal if no health profile exists
                                router.replace("/(auth)/onboarding-modal");
                            } else {
                                router.replace("/(tabs)");
                            }
                        } else {
                            router.replace("/(tabs)");
                        }
                    });
                });
            } else {
                setUser(null);
                router.replace("/(auth)/welcome");
            }
        });

        return () => unsub();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true }

        } catch (error: any) {
            let msg = error.message;
            console.log("err msg:", msg);
            if(msg.includes("(auth/invalid-credential)")){
                msg= "Hatalı giriş";
            }
            if(msg.includes("(auth/invalid-email)")){
                msg= "Hatalı email";
            }
            return { success: false, msg }
        }
    };

    const register = async (email: string, password: string, firstName: string, lastName: string) => {
        try {
            let response = await createUserWithEmailAndPassword(
                auth,
                email,
                password);
            await setDoc(doc(firestore, "patients", response?.user?.uid), {
                firstName,
                lastName,
                email,
                uid: response?.user?.uid,
            });
            
            // After registration, redirect to onboarding modal
            router.replace("/(auth)/onboarding-modal");
            
            return { success: true }

        } catch (error: any) {
            let msg = error.message;
            if(msg.includes("(auth/email-already-in-use)")){
                msg= "Bu email zaten kullanılıyor";
            }
            if(msg.includes("(auth/invalid-email)")){
                msg= "Hatalı email";
            }
            return { success: false, msg }
        }
    };

    const updateUserData = async (uid: string) => {
        try {
            const docRef = doc(firestore, "patients", uid);
            const docSnap = await getDoc(docRef);


            if (docSnap.exists()) {
                const data = docSnap.data();
                const userData: UserType = {
                    uid: data?.uid,
                    email: data.email || null,
                    firstName: data.firstName || null,
                    lastName: data.lastName || null,
                    image: data.image || null,
                    healthProfile: data.healthProfile || null,
                };
                setUser({ ...userData });

            }
        } catch (error: any) {
            let msg = error.message;
            // return { success: false, msg }
            console.log('error', error);
        }
    };

    const updateHealthProfile = async (
        uid: string, 
        healthProfileData: UserHealthProfile
    ): Promise<{ success: boolean; msg?: string }> => {
        try {
            const docRef = doc(firestore, "patients", uid);
            
            // Update the health profile in Firestore
            await updateDoc(docRef, {
                healthProfile: healthProfileData,
            });
            
            // Update local user state
            if (user) {
                setUser({
                    ...user,
                    healthProfile: healthProfileData,
                });
            }
            
            return { success: true };
        } catch (error: any) {
            console.error('Error updating health profile:', error);
            return { 
                success: false, 
                msg: error.message || 'Failed to update health profile' 
            };
        }
    };

    const contextValue: AuthContextType = {
        user,
        setUser,
        login,
        register,
        updateUserData,
        updateHealthProfile,
    }

    return (
        <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}