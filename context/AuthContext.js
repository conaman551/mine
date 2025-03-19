import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";
//import { getUserPosition } from "../Components/rideSearchFunctions";
import { localAddress } from '../constants';
const API_URL = localAddress;
export const AuthContext = createContext();

export const AuthProvider = ( {children} ) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDriver, setIsDriver] = useState(false);
    const [userID, setUserID] = useState(null);
    const [userToken, setUserToken] = useState(null);
    const [regScreen,setRegScreen] = useState(0);
   // const [email, setEmail] = useState('');
    const [loggedIn,setLoggedin] = useState(false);
    const [completedRegistration, setCompletedRegistration] = useState(false);
    const [driverID, setDriverID]  = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);

    const Oauth = async(token) => {
        await AsyncStorage.setItem("userToken", token);          
        setUserToken(token);
    }
    
    const login = async (token,uid) => {     
                await AsyncStorage.setItem("userToken", token);          
                await AsyncStorage.setItem("UID",uid);  //Temporary until api calls changed
                 setLoggedin(true);
                 setUserToken(token);
                 setUserID(uid);
    };

    const getPosition = async () => {
        console.log('get position ...')
        const userPosition = await getUserPosition();
        const pos = JSON.stringify(userPosition);
        AsyncStorage.setItem("userPosition",pos);          
    }
    
    const logout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", onPress: () => { return; } },
        
            { text: "Confirm", onPress: () => {   
                setUserToken(null)
                AsyncStorage.removeItem("userToken")
                    .then(() => {             
                        //'removed')   
                        setIsLoading(false);                        
                    })                       
                    .catch(error => {                  
                        setIsLoading(false);              
                        console.error("Error removing userToken from AsyncStorage: ", error);             
                    }); 
                setTimeout(()=>{
                setLoggedin(false);
                resetRegistrationComplete();
            },20)
                                
                }
            }        
        ]);
    
   
    };
    const saveRegScreen = async(screen) => {
        AsyncStorage.setItem("regScreen",String(screen))
        const num = Number(screen)
        setRegScreen(num)
    }

    const isLoggedIn = async() => {
        try {
            let userToken = await AsyncStorage.getItem("userToken");     
            let compRegistration = await AsyncStorage.getItem("registrationComplete");  
            let regscreen = await AsyncStorage.getItem("regScreen");
            if (regscreen) {
                saveRegScreen(regscreen);
            }
            console.log('token',userToken);
            if (userToken) {
                setLoggedin(true)
                setUserToken(userToken);
            }
            if (compRegistration === 'true') {
                setCompletedRegistration(true);
            }
           setIsLoading(false);
        }
        catch(e) {
            setIsLoading(false);
            console.log(e)//"isLoggedIn error: ",e.toString() );
        }
    }; 

    const completeRegistration = async () => {

        setCompletedRegistration(true);
        await AsyncStorage.setItem("registrationComplete","true");
        return true;
    };
    

    const resetRegistrationComplete = async () => {
               AsyncStorage.removeItem("regScreen");
                AsyncStorage.removeItem("registrationComplete");
                setCompletedRegistration(false);
                setRegScreen(0);
    };

  //  const response = await fetch(`${API_URL}/auth/getMyID`, getMyIDRequestOptions);
  const getID = async () => {
    let userToken = await AsyncStorage.getItem("userToken");
    try {
        const getMyIDRequestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + userToken,
            },
        };
        const response = await fetch(`${API_URL}/auth/getMyID`, getMyIDRequestOptions);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.message;
    }
    catch (error) {     
        console.log(error)//`GET RECEIVER NAME ERROR: ${error.message}`);     
    }
};

    const getUserPhoto = async () => {
        let userToken = await AsyncStorage.getItem("userToken");
        try {
            const getMyIDRequestOptions = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + userToken,
                },
            };
            const response = await fetch(`${API_URL}/user/getProfilePicture`, getMyIDRequestOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data.message;
        }
        catch (error) {     
            console.log(error)//`GET RECEIVER NAME ERROR: ${error.message}`);     
        }
    };

    const saveProfilePic = async (localUri) => {
         setProfilePicture(localUri)
    }

    const saveLoading = async (isloading) => {
        console.log('saveload')
        setIsLoading(isloading)
   }

    const getProfilePic = async () => {
        try {
          
            
            let photo = await getUserPhoto();
            let id = await getID();
            let url = `${API_URL}/user/profile_images/${photo}`
            console.log('pho',url)
            setProfilePicture(url)        
            setUserID(id);
            // const response = await fetch(`${API_URL}/ride/getPrice?time=${Date.now()}&origin=${origin}&destination=${destination}`);
        }
        catch (e) {
            //"error:", e)
            return { iserror: true }
        }
    }
    
    const checkIsDriver = async () => {
        try {
            const response = await fetch(`${API_URL}/driver/isDriver`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + userToken,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setIsDriver(data.message); 
                if (data.message === true) {
                    getDriverID()
                }
            }
            } catch (error) {
            console.error('Error checking driver status:', error);
            }
        };
        const getDriverID = async () => {
            try {
                const response = await fetch(`${API_URL}/driver/getMyDriverInfo`, {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + userToken,
                    },
                });
            
                if (response.status === 200) {
                    const data = await response.json();
                    setDriverID(data.message.driverid);
                } else {
                    setDriverID(null);
                }
                } catch (error) {
                console.error('Error getting driverID:', error);
                }
            };

    useEffect(() => {
       isLoggedIn();
      //setIsLoading(false);
        if (userToken) {
           // isRegistrationComplete();
           // checkIsDriver();
           // getDriverID();
           // getEmail();
          //  getPosition();
         //   getProfilePic();
        }   
    }, [userToken]); 

    return (
        <AuthContext.Provider
            value={{
                login,
                Oauth,
                logout,
                completeRegistration,
                resetRegistrationComplete,
               // updateEmailToken,
              //  updatePasswordToken,
                checkIsDriver,
                getProfilePic,
                saveProfilePic,
                saveLoading,
                saveRegScreen,
                isLoggedIn,
                userID,
                isDriver,
                userToken,
             //   email,
                loggedIn,
                isLoading,
                regScreen,
                completedRegistration,
                driverID,
                profilePicture
                
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};