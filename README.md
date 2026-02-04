<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>

<h1>Medi_Query 🩺🔍</h1>
<p>
  <strong>MediQuery</strong> is a smart medical enquiry app built with <strong>React Native</strong>, available for both Android and iOS.
  It helps users explore medicines in detail, compare alternatives, locate nearby medical stores, and manage medicine schedules with timely reminders.
</p>

<hr>

<h2>🚀 Features</h2>

<h3>🏠 Home</h3>
<ul>
  <li>Search and discover medicines easily.</li>
  <li>Get detailed information: composition, company name, substitutes, price, and popularity.</li>
  <li>When a medicine is searched, similar medicines and their prices also appear — helping users find affordable substitutes.</li>
</ul>

<h3>🗺️ Maps</h3>
<ul>
  <li>View nearby medical stores using real-time location.</li>
  <li>Integrated with location services to quickly find and navigate to pharmacies.</li>
</ul>

<h3>⏰ Reminder</h3>
<ul>
  <li>Schedule and manage medicine intake reminders.</li>
  <li>Set daily or weekly reminders with push notifications.</li>
  <li>Never miss a dose with customizable alerts powered by Expo Notifications and Firebase Cloud Messaging.</li>
</ul>

<h3>👤 Profile</h3>
<ul>
  <li>Manage personal details and preferences.</li>
  <li>Track BMR, BMI, and health metrics to indicate proper doses.</li>
  <li>View past reminders and medicine history.</li>
</ul>

<hr>

<h2>📱 Platforms</h2>
<ul>
  <li>Android</li>
  <li>iOS</li>
  <li>Built with <strong>React Native</strong> for a seamless cross-platform experience.</li>
</ul>

<hr>

<h2>🛠️ Tech Stack</h2>
<ul>
  <li><strong>Frontend:</strong> React Native (Expo)</li>
  <li><strong>Backend (Optional):</strong> Node.js / Express.js + MongoDB</li>
  <li><strong>Dataset:</strong> A–Z medicines dataset of India</li>
  <li><strong>Notifications:</strong> Expo inbuilt notifications & Firebase Cloud Messaging</li>
  <li><strong>Maps:</strong> Google Maps API / Mapbox</li>
</ul>

<hr>

<h2>📸 App Structure</h2>
<pre><code>
MediQuery/
│
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── MapsScreen.js
│   │   ├── ReminderScreen.js
│   │   └── ProfileScreen.js
│   ├── components/
│   ├── navigation/
│   └── utils/
│
├── services/                   # Backend & Configurations
│   ├── server.js               # Express Server (API handling)
│   └── .env                    # Environment Variables
│
├── App.js
├── package.json
└── README.md
</code></pre>

<hr>

<h2>🗄️ Database (MongoDB)</h2>
<p>
  MediQuery uses <strong>MongoDB Atlas</strong> (cloud-hosted NoSQL database).  
  Below is the organization and cluster setup:
</p>

<ul>
  <li><strong>Organization:</strong> Surath's Org - 2024-12-09</li>
  <li><strong>Project:</strong> Medi_Query</li>
  <li><strong>Cluster:</strong> medicines</li>
  <li><strong>Database:</strong> ENQUIRY</li>
  <li><strong>Collection:</strong> A_Z_medidb</li>
</ul>

<pre><code>
MONGO_URI="mongodb+srv://root:root@medicines.fcj01tp.mongodb.net/?retryWrites=true&w=majority&appName=medicines"
PORT=5000
</code></pre>

<p>
  - <strong>Username:</strong> root <br>
  - <strong>Password:</strong> root <br>
  - Default authority: <code>read</code> on <code>mediquery</code> DB. <br>
  - Update <code>.env</code> for local or Atlas usage.
</p>

<hr>

<h2>⚙️ Installation & Setup</h2>
<ol>
  <li>
    <strong>Clone the repository</strong>
    <pre><code>
git clone https://github.com/Surath83/MediQuery.git
cd MediQuery
    </code></pre>
  </li>
  <li>
    <strong>Install dependencies</strong>
    <pre><code>
npm install
# or
yarn install
    </code></pre>
  </li>
  <li>
    <strong>Setup Environment Variables</strong>
    <p>Create a <code>.env</code> file inside <code>/services</code>:</p>
    <pre><code>
MONGO_URI=mongodb://root:root@localhost:27017/mediquery?authSource=admin
PORT=5000
    </code></pre>
  </li>
</ol>

<hr>

<h2>▶️ Running the App</h2>

<h3>Run on Android</h3>
<pre><code>
npx react-native run-android
</code></pre>

<h3>Run on iOS (Mac + Xcode required)</h3>
<pre><code>
npx pod-install ios
npx react-native run-ios
</code></pre>

<h3>Start Metro Bundler</h3>
<pre><code>
npx react-native start
or
npx expo start
</code></pre>

<h3>Run Backend (Node.js)</h3>
<pre><code>
cd services
node server.js
</code></pre>

<hr>
<h3>📦 Build APK (Android)</h3>
<pre><code>
npx expo prebuild
cd android
gradlew assembleRelease
</code></pre>

<p>APK will be generated inside:</p>

<pre><code>android/app/build/outputs/apk/release/</code></pre>

<h3>🍎 iOS Build (IPA)</h3>
<p>npx expo prebuild</p>
<pre><code>
cd ios
pod install
open MediQuery.xcworkspace
</code></pre>

<hr>

<h2>Backend URL (endpoint)</h2>
<p>
  <a src="https://medi-query.onrender.com">https://medi-query.onrender.com</a>
  <br />
  <p>/suggestions?q=Augmen</p>
  <pre><code>
  [
  {
    "name": "Augmentin Duo Oral Suspension"
  },
  {
    "name": "Augmentin DDS Suspension"
  },
  {
    "name": "Augmentin 1.2gm Injection"
  },
  {
    "name": "Augmentin 375 Tablet"
  },
  {
    "name": "Augmentin ES Oral Suspension"
  },
  {
    "name": "Augmentin 625 Duo Tablet"
  }
]
  </code></pre>
</p>

<hr>

<h2>🤝 Contributing</h2>
<p>
  Contributions, issues, and feature requests are welcome!  
  Feel free to <strong>open an issue</strong> or <strong>submit a PR</strong>.
</p>

<hr>

<h2>📄 License</h2>
<p>This project is licensed under the <strong>MIT License</strong>.</p>

</body>
</html>
