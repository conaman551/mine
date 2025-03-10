import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Load from .env
const API_URL = 'https://your-production-api.com'; // Production HTTPS URL

function useGoogleAuth(navigation) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const redirectUri = makeRedirectUri({ scheme: 'com.yourapp' }); // Custom scheme for production

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: 'code',
    },
    discovery
  );

  useEffect(() => {
    if (response) {
      setLoading(true);
      if (response.type === 'success') {
        const { code } = response.params;
        fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })
          .then(res => {
            if (!res.ok) throw new Error('Authentication failed');
            return res.json();
          })
          .then(async data => {
            if (!data.token) throw new Error('No token received');
            await AsyncStorage.setItem('jwtToken', data.token);
            navigation.navigate('Home');
          })
          .catch(err => setError(err.message))
          .finally(() => setLoading(false));
      } else if (response.type === 'error') {
        setError('Authentication error: ' + response.params.error);
        setLoading(false);
      } else if (response.type === 'dismiss') {
        setLoading(false); // User canceled
      }
    }
  }, [response, navigation]);

  return { request, promptAsync, loading, error };
}

// In your Landing component:
function Landing() {
  const navigation = useNavigation();
  const { request, promptAsync, loading, error } = useGoogleAuth(navigation);

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={() => promptAsync()}
        disabled={!request || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}