import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.educart.app",
  appName: "EduCart",
  webDir: "empty", 
  server: {
  url: "https://educart-capstone.vercel.app",
  cleartext: true
}

};

export default config;
