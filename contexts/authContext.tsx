import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserHealthProfile, UserType } from "@/types";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";


const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType>(null);
    const router = useRouter();
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser?.uid,
                    email: firebaseUser?.email,
                    firstName: firebaseUser?.displayName,
                    lastName: firebaseUser?.displayName
                });

                try {
                    // Önce kullanıcı verilerini al
                    const userData = await getUserData(firebaseUser.uid);
                    
                    if (userData?.role === 'doctor') {
                        // Doktor ise doğrudan tabs'a yönlendir
                        console.log("Doktor girişi yapıldı, rol:", userData.role);
                        router.replace("/(tabs)");
                    } else {
                        // Hasta ise health profile kontrolü yap
                        const docRef = doc(firestore, "patients", firebaseUser.uid);
                        const docSnap = await getDoc(docRef);
                        
                        if (docSnap.exists()) {
                            const patientData = docSnap.data();
                            if (!patientData.healthProfile) {
                                // Redirect to onboarding modal if no health profile exists
                                router.replace("/(auth)/onboarding-modal");
                            } else {
                                router.replace("/(tabs)");
                            }
                        } else {
                            router.replace("/(tabs)");
                        }
                    }
                } catch (error) {
                    console.error("Kullanıcı verisi alınırken hata:", error);
                    router.replace("/(tabs)");
                }
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

    const logout = async (): Promise<{ success: boolean; msg?: string }> => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error: any) {
            console.log("Çıkış yaparken hata:", error);
            return { 
                success: false, 
                msg: error.message || "Çıkış yapılırken bir hata oluştu" 
            };
        }
    };

    const register = async (email: string, password: string, firstName: string, lastName: string) => {
        try {
            let response = await createUserWithEmailAndPassword(
                auth,
                email,
                password);
            
            // Her zaman patients koleksiyonuna kaydet, sadece hastalar kayıt olabilir
            await setDoc(doc(firestore, "patients", response?.user?.uid), {
                firstName,
                lastName,
                email,
                uid: response?.user?.uid,
                role: 'patient'
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

    const getUserData = async (uid: string): Promise<UserType> => {
        try {
            // First check if the user is a patient
            const patientDocRef = doc(firestore, "patients", uid);
            const patientDocSnap = await getDoc(patientDocRef);

            if (patientDocSnap.exists()) {
                const data = patientDocSnap.data();
                const userData: UserType = {
                    uid: data?.uid,
                    email: data.email || null,
                    firstName: data.firstName || null,
                    lastName: data.lastName || null,
                    image: data.image || null,
                    healthProfile: data.healthProfile || null,
                    role: 'patient'
                };
                setUser({ ...userData });
                return userData;
            }

            // If not found in patients, check doctors collection
            const doctorDocRef = doc(firestore, "doctors", uid);
            const doctorDocSnap = await getDoc(doctorDocRef);

            if (doctorDocSnap.exists()) {
                const data = doctorDocSnap.data();
                console.log("Bulunan doktor verisi:", data);
                const userData: UserType = {
                    uid: data?.uid,
                    email: data.email || null,
                    firstName: data.firstName || null,
                    lastName: data.lastName || null,
                    image: data.image || null,
                    role: data.role || 'doctor' // Firestore'dan role değerini al veya varsayılan olarak 'doctor' ata
                };
                setUser({ ...userData });
                return userData;
            }

            return null;
        } catch (error: any) {
            console.log('Kullanıcı verisi alınırken hata:', error);
            return null;
        }
    };

    const updateUserData = async (uid: string): Promise<void> => {
        await getUserData(uid);
        return;
    };

    const updateHealthProfile = async (
        uid: string, 
        healthProfileData: UserHealthProfile
    ): Promise<{ success: boolean; msg?: string }> => {
        try {
            // Önce kullanıcı rolünü kontrol et
            const userData = await getUserData(uid);
            
            // Eğer kullanıcı doktor ise, işlem yapmadan başarılı döndür
            if (userData?.role === 'doctor') {
                console.log("Doktor kullanıcı için sağlık profili güncelleme atlandı");
                return { success: true };
            }
            
            // Hasta ise normal işleme devam et
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
        logout
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