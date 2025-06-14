import { auth, db } from "@/config/firebase";
import { AuthContextType, UserHealthProfile, UserType, DoctorProfile } from "@/types";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
                    // Kullanıcı verilerini al ve role'ü kontrol et
                    const userData = await getUserData(firebaseUser.uid);
                    
                    if (userData?.role === 'doctor') {
                        // Doktor ise doğrudan tabs'a yönlendir
                        console.log("Doktor girişi yapıldı, rol:", userData.role);
                        router.replace("/(tabs)");
                    } else if (userData?.role === 'patient') {
                        // Hasta ise health profile kontrolü yap
                        const docRef = doc(db, "patients", firebaseUser.uid);
                        const docSnap = await getDoc(docRef);
                        
                        if (docSnap.exists()) {
                            const patientData = docSnap.data();
                            if (!patientData.healthProfile) {
                                // Health profile yoksa onboarding'e yönlendir
                                router.replace("/(auth)/onboarding-modal");
                            } else {
                                router.replace("/(tabs)");
                            }
                        } else {
                            router.replace("/(tabs)");
                        }
                    } else {
                        // Kullanıcı bulunamadıysa welcome sayfasına yönlendir
                        console.log("Kullanıcı bulunamadı, welcome sayfasına yönlendiriliyor");
                        router.replace("/(auth)/welcome");
                    }
                } catch (error) {
                    console.error("Kullanıcı verisi alınırken hata:", error);
                    router.replace("/(auth)/welcome");
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
            await setDoc(doc(db, "patients", response?.user?.uid), {
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
            const patientDocRef = doc(db, "patients", uid);
            const patientDocSnap = await getDoc(patientDocRef);

            if (patientDocSnap.exists()) {
                const data = patientDocSnap.data();
                
                // Local'den resmi yükle
                let imageUri = null;
                if (data.image && data.image.startsWith('local://')) {
                    imageUri = await loadProfileImageFromStorage(uid);
                } else {
                    imageUri = data.image;
                }
                
                const userData: UserType = {
                    uid: data?.uid,
                    email: data.email || null,
                    firstName: data.firstName || null,
                    lastName: data.lastName || null,
                    image: imageUri,
                    healthProfile: data.healthProfile || null,
                    role: 'patient'
                };
                setUser({ ...userData });
                return userData;
            }

            // If not found in patients, check doctors collection
            const doctorDocRef = doc(db, "doctors", uid);
            const doctorDocSnap = await getDoc(doctorDocRef);

            if (doctorDocSnap.exists()) {
                const data = doctorDocSnap.data();
                console.log("Bulunan doktor verisi:", data);
                
                // Local'den resmi yükle
                let imageUri = null;
                if (data.image && data.image.startsWith('local://')) {
                    imageUri = await loadProfileImageFromStorage(uid);
                } else {
                    imageUri = data.image;
                }
                
                // Doktor adını normalize et
                const firstName = data.firstName || data.name?.split(' ')[0] || 'Doktor';
                const lastName = data.lastName || data.name?.split(' ').slice(1).join(' ') || '';
                
                const userData: UserType = {
                    uid: data?.uid,
                    email: data.email || null,
                    firstName: firstName,
                    lastName: lastName,
                    image: imageUri,
                    doctorProfile: {
                        specialization: data.specialization || data.specialty,
                        licenseNumber: data.licenseNumber,
                        hospital: data.hospital,
                        department: data.department,
                        experience: data.experience,
                        education: data.education || [],
                        certifications: data.certifications || []
                    },
                    role: data.role || 'doctor'
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
            const docRef = doc(db, "patients", uid);
            
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

    const uploadProfileImage = async (
        uid: string,
        imageUri: string
    ): Promise<{ success: boolean; url?: string; msg?: string }> => {
        try {
            console.log('Starting image save for user:', uid);
            
            // Resmi AsyncStorage'a kaydet
            const storageKey = `profile_image_${uid}`;
            await AsyncStorage.setItem(storageKey, imageUri);
            console.log('Image saved to AsyncStorage');
            
            return { success: true, url: imageUri };
        } catch (error: any) {
            console.error('Error saving profile image:', error);
            
            return { 
                success: false, 
                msg: 'Resim kaydedilemedi. Cihaz belleği dolu olabilir.'
            };
        }
    };

    const updateProfileImage = async (
        uid: string,
        imageUri: string
    ): Promise<{ success: boolean; msg?: string }> => {
        try {
            // Resmi local'e kaydet
            const uploadResult = await uploadProfileImage(uid, imageUri);
            
            if (!uploadResult.success) {
                return { success: false, msg: uploadResult.msg };
            }
            
            // Sadece Firestore'da image URL'ini güncelle (local path olarak)
            const userData = await getUserData(uid);
            const collection = userData?.role === 'doctor' ? 'doctors' : 'patients';
            
            const docRef = doc(db, collection, uid);
            await updateDoc(docRef, {
                image: `local://${uid}`, // Local reference olarak sakla
            });
            
            // Local user state'i güncelle
            if (user) {
                setUser({
                    ...user,
                    image: imageUri, // Gerçek local path'i state'te sakla
                });
            }
            
            return { success: true };
        } catch (error: any) {
            console.error('Error updating profile image:', error);
            return { 
                success: false, 
                msg: error.message || 'Profil resmi güncellenemedi'
            };
        }
    };

    const loadProfileImageFromStorage = async (uid: string): Promise<string | null> => {
        try {
            const storageKey = `profile_image_${uid}`;
            const imageUri = await AsyncStorage.getItem(storageKey);
            return imageUri;
        } catch (error) {
            console.error('Error loading profile image from storage:', error);
            return null;
        }
    };

    const refreshUserData = async (): Promise<void> => {
        if (user?.uid) {
            await getUserData(user.uid);
        }
    };

    const contextValue: AuthContextType = {
        user,
        setUser,
        login,
        register,
        updateUserData,
        updateHealthProfile,
        updateProfileImage,
        refreshUserData,
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