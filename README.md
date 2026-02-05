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

<h2>Logo</h2>
<img  src="https://raw.githubusercontent.com/Surath83/Medi_Query/main/snaps/MediQuery.JPG"
      width="110"
      height="110"
      alt="App Logo"
        />
<hr>

<h2>🚀 What MediQuery Offers</h2>

<h3>🌗 Smart & Accessible UI</h3>
<ul>
  <li><strong>Light / Dark Mode</strong> support for comfortable viewing in all environments</li>
  <li>Clean, minimal, and mobile-first design</li>
</ul>

<h3>🔬 Medical Intelligence</h3>
<ul>
  <li>
    <strong>Similar Medical Composition Finder</strong><br />
    Find alternative medicines with the same or similar composition
  </li>
  <li>Detailed medicine information for safer choices</li>
</ul>

<h3>🏥 Nearby Healthcare Access</h3>
<ul>
  <li>
    <strong>Nearest Pharmacy Locator</strong><br />
    Quickly discover nearby medical stores when you need them the most
  </li>
</ul>

<h3>⏰ Health Management Tools</h3>
<ul>
  <li>
    <strong>Medicine Reminders</strong><br />
    Never miss a dose with timely reminder notifications
  </li>
  <li>
    <strong>One-Click Medicine List Sharing</strong><br />
    Instantly share your medicine list with family members or caregivers
  </li>
</ul>

<h3>📊 Health Metrics Tracking</h3>
<ul>
  <li><strong>BMI &amp; BMR Calculator</strong></li>
  <li>Track and monitor:</li>
  <ul>
    <li>Weight</li>
    <li>Height</li>
    <li>Body health indicators over time</li>
  </ul>
</ul>

<h3>🚀 Productivity &amp; Convenience</h3>
<ul>
  <li>Fast search and intuitive navigation</li>
  <li>Secure local data handling</li>
  <li>Designed for everyday medical needs</li>
</ul>


<h2 align="center">🖼️ App Screenshots</h2>

<h3 align="center">🔹 Main Pages / Core Features</h3>

<div align="center">
  <table>
    <tr>
      <td>
        <img
          src="https://raw.githubusercontent.com/Surath83/Medi_Query/main/snaps/1.0.jpeg"
          width="240"
          height="480"
          alt="Home Screen - Medical Enquiry"
        />
      </td>
      <td>
        <img
          src="https://raw.githubusercontent.com/Surath83/Medi_Query/main/snaps/2.0.jpeg"
          width="240"
          height="480"
          alt="Search History Screen"
        />
      </td>
      <td>
        <img
          src="https://raw.githubusercontent.com/Surath83/Medi_Query/main/snaps/3.0.jpeg"
          width="240"
          height="480"
          alt="Medicine Detail Screen"
        />
      </td>
      <td>
        <img
          src="https://raw.githubusercontent.com/Surath83/Medi_Query/main/snaps/4.0.jpeg"
          width="240"
          height="480"
          alt="Suggested Medicines Screen"
        />
      </td>
    </tr>
  </table>
</div>

<hr />

<h3 align="center">🔹 Sub-Modules / Additional Pages</h3>

<div align="center">
  <table>
    <tr>
      <td>
        <img
          src="https://raw.githubusercontent.com/Surath83/Medi_Query/main/snaps/1.1.jpeg"
          width="240"
          height="480"
          alt="Sub Module Screen 1"
        />
      </td>
      <td>
        <img
          src="https://raw.githubusercontent.com/Surath83/Medi_Query/main/snaps/4.1.jpeg"
          width="240"
          height="480"
          alt="Sub Module Screen 2"
        />
      </td>
    </tr>
  </table>
</div>

<hr />


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
