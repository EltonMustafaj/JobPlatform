import { StyleSheet, Image } from 'react-native';
import { View } from '@/components/Themed';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/job-search-logo.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
  },
  logo: {
    width: '90%',
    height: 300,
  },
});
