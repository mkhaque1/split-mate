import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { fetchmyuser } from './src/utils/FetchUserData/FetchUserData';
import { UpdateUserData } from './src/utils/UpdateUserPackage/UpdateUserPackage';
const ThemeContext = createContext();

export const Themer = ({ children }) => {
  const [primary, setPrimary] = useState('#f59e0b');
  const [MemberType,setMemberType] = useState('Free');
  const [UserData,setUserData] =useState(null)

  const [secondary, setSecondary] = useState('gray');
  const [background, setBackground] = useState('black');
  const [Tcolor,setTcolor] = useState('white')
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [theme, setTheme] = useState('light');
  const [MethodName,setMethodName] = useState('')


  useEffect(() => {
  const checkSubscription = async () => {
    try {
      const data = await AsyncStorage.getItem('UserData');
      console.log('UserData from AsyncStorage:', data);
      if (!data) return;
console.log('UserData exists in AsyncStorage');
      const parsed = JSON.parse(data);
      const Email = parsed?.Email 
      console.log('Parsed UserData:', parsed);

      const maindata = await fetchmyuser({ Email });
      console.log('Fetched user data:', maindata);
      const PlanExpiry = maindata?.PlanExpiry;

      if (maindata) {
        const expiryDate = new Date(PlanExpiry);
        const now = new Date();

        console.log('Checking PlanExpiry:', expiryDate);
        console.log('Checking currentDate:', now);

        if (expiryDate <= now || PlanExpiry === null) {
          console.log('Subscription expired');
          Alert.alert(
            'Subscription Expired',
            'Your subscription has expired. Please renew to continue enjoying premium features.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  setMemberType('Free');
                  setIsSubscribed(false);
                  await UpdateUserData({
                    Email,
                    UserData: {
                      Plan: 'Free Plan',
                      PlanExpiry: null,
                    },
                  });
                  setUserData({...maindata, Plan: 'Free Plan', PlanExpiry: null});
                  await AsyncStorage.setItem('UserData', JSON.stringify({
                    ...maindata,
                    Plan: 'Free Plan',
                    PlanExpiry: null,
                  })
                  );
                },
              },
            ]
          );
        } else {
          // Subscription still valid
          setUserData(parsed);
        }
      } else {
        // No PlanExpiry, treat as free
        setUserData(parsed);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  checkSubscription();
}, []);

  useEffect(() => {
    if (theme === 'light') {
      // setPrimary('#26f7fd');
      setPrimary('#f59e0b');

      setSecondary('gray');
      setBackground('#fff');
      setTcolor('black')
    } else if (theme === 'dark') {
      setPrimary('#f59e0b');

      setSecondary('gray');
      setBackground('black');
      setTcolor('#fff')
    }
  }, [theme]);

  const toggleTheme = async () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ Tcolor,primary, secondary, background,theme, toggleTheme,MethodName,setMethodName,MemberType,setMemberType,UserData,setUserData }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
