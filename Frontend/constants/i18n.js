import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

// =========================================================
// SUPPORTED LANGUAGES
// =========================================================

export const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം'
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ'
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ'
  }
]

// =========================================================
// STORAGE KEYS
// =========================================================

export const LANGUAGE_SETUP_PREFIX = 'MEDIQUERY_LANGUAGE_SETUP_V1_'

export const LANGUAGE_VALUE_PREFIX = 'MEDIQUERY_LANGUAGE_V1_'

// =========================================================
// TRANSLATIONS
// =========================================================

const translations = {
  // =======================================================
  // ENGLISH
  // =======================================================

  en: {
    app: {
      selectLanguage: 'Select Language',
      language: 'Language',
      done: 'Done',
      chooseLanguage: 'Choose your preferred language',
      changeAnytime: 'You can change the language anytime from the Home screen.'
    },

    tabs: {
      home: 'Home',
      maps: 'Maps',
      reminder: 'Reminder',
      profile: 'Profile'
    },

    home: {
      title: 'Home Screen',
      subtitle: 'Search medicines and find nearby pharmacies',
      searchMedicine: 'Search Medicine'
    },

    login: {
      missingFields: 'Missing Fields',
      enterCredentials: 'Please enter email and password',
      success: 'Success',
      welcome: 'Welcome {{name}}',
      loginFailed: 'Login Failed',
      somethingWrong: 'Something went wrong',
      email: 'Email',
      password: 'Password',
      login: 'Login',
      registerPrompt: "Don't have an account? Register",
      subtitle: 'Search Medicines & Find Nearby Pharmacies'
    },

    profile: {
      title: 'Profile',
      subtitle: 'Manage your personal health information',

      // Profile screen
      edit: 'Edit Profile',
      editProfile: 'Edit Profile',
      updateInformation: 'Update Information',
      saveChanges: 'Save Changes',
      logout: 'Logout',
      language: 'Language',

      // Local storage information
      localStorageInfo:
        'Your profile information is stored locally on your device.',
      stored: 'Your profile information is stored locally on your device.',

      // Status messages
      updated: 'Profile Updated',
      saved: 'Your profile has been saved successfully.',
      error: 'Error',
      logoutFailed: 'Logout failed',

      // Profile information
      name: 'Name',
      age: 'Age',
      year: 'yr',
      height: 'Ht',
      weight: 'Wt',
      cm: 'cm',
      kg: 'kg',

      // Health calculations
      bmi: 'BMI',
      bmr: 'BMR',
      calPerDay: 'cal/day',

      // Gender
      gender: 'Gender',

      genderOptions: {
        male: 'Male',
        female: 'Female',
        other: 'Other',
        'prefer not to say': 'Prefer not to say'
      }
    },

    reminder: {
      title: 'Reminder',
      medicineName: 'Medicine name',

      selectTime: 'Select Time',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      custom: 'Custom',

      beforeAfterFood: 'Before / After Food',
      before: 'Before',
      after: 'After',
      beforeFood: 'before food',
      afterFood: 'after food',

      reminderOffset: 'Reminder Offset',
      min: 'min',

      endDateOptional: 'End Date (optional)',
      selectEndDate: 'Select End Date',

      saveReminder: 'Save Reminder',

      reminders: 'Reminders',
      noRemindersYet: 'No reminders yet.',
      unknown: 'Unknown',

      daily: 'Daily',
      oneTime: 'One-time',
      ends: 'Ends:',
      status: 'Status:',

      pending: 'Pending',
      taken: 'Taken',
      missed: 'Missed',

      medicineReminder: 'Medicine Reminder',
      medicineReminders: 'Medicine Reminders',
      take: 'Take',

      missingField: 'Missing field',
      enterMedicine: 'Please enter a medicine name.',

      invalidTime: 'Invalid Time',
      selectValidTime: 'Please select a valid reminder time.',

      invalidEndDate: 'Invalid End Date',
      endDateFuture: 'End date must be today or a future date.',

      reminderSaved: 'Reminder Saved',
      scheduled: 'Your medicine reminder has been scheduled.',
      savedNoNotifications:
        'Your reminder was saved, but notifications are unavailable in the current environment.',

      storageError: 'Storage Error',
      unableToSave: 'Unable to save your reminder.',

      noReminders: 'No reminders',
      noRemindersToShare: 'You have no reminders to share.',

      myMedicineReminders: 'My Medicine Reminders',

      shareFailed: 'Share failed',
      unableToShare: 'Unable to share reminders.'
    },

    maps: {
      title: 'Nearest Medical Shops',
      subtitle: 'Pharmacies near your current location',
      gettingLocation: 'Getting your location...',
      loadingShops: 'Loading nearby medical shops...',
      medicalShop: 'Medical Shop',
      pharmacy: 'Pharmacy',
      pharmacyNearby: 'Pharmacy nearby',
      addressNotAvailable: 'Address not available',
      permissionRequired: 'Permission Required',
      locationPermission: 'Location permission is required.',
      fetchError: 'Could not fetch nearby medical shops.',
      locationError: 'Could not get location.',
      openMapsError: 'Could not open maps app.',
      directionsTo: 'Directions to {{name}}'
    },

    medicine: {
      search: 'Search Medicine',
      searchPlaceholder: 'Enter medicine name',
      suggestions: 'Suggestions',
      history: 'Search History',
      clearHistory: 'Clear History',
      details: 'Medicine Details',
      substitutes: 'Suggested Substitutes',
      price: 'Price',
      close: 'Close',
      noResults: 'No medicine found.'
    },

    // =====================================================
    // MED
    // =====================================================

    med: {
      medicalEnquiry: 'Medical Enquiry',
      tabletName: 'Tablet Name',
      enterTabletName: 'Enter tablet name',
      search: 'Search',
      searchHistory: 'Search History',
      noHistory: 'No history yet',
      suggested: 'Suggested',

      manufacturer: 'Manufacturer',
      price: 'Price',
      type: 'Type',
      packaging: 'Packaging',
      composition1: 'Composition 1',
      composition2: 'Composition 2',
      sideEffects: 'Side Effects',
      use: 'Use',
      chemicalClass: 'Chemical Class',
      habitForming: 'Habit Forming',
      therapeuticClass: 'Therapeutic Class',
      actionClass: 'Action Class',
      close: 'Close'
    },

    common: {
      cancel: 'Cancel',
      close: 'Close',
      done: 'Done',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      error: 'Error',
      success: 'Success',
      loading: 'Loading...',
      retry: 'Retry',
      yes: 'Yes',
      no: 'No'
    }
  },

  // =======================================================
  // HINDI
  // =======================================================

  hi: {
    app: {
      selectLanguage: 'भाषा चुनें',
      language: 'भाषा',
      done: 'हो गया',
      chooseLanguage: 'अपनी पसंदीदा भाषा चुनें',
      changeAnytime: 'आप होम स्क्रीन से कभी भी भाषा बदल सकते हैं।'
    },

    tabs: {
      home: 'होम',
      maps: 'मानचित्र',
      reminder: 'रिमाइंडर',
      profile: 'प्रोफ़ाइल'
    },

    home: {
      title: 'होम स्क्रीन',
      subtitle: 'दवाइयाँ खोजें और आस-पास की फार्मेसियाँ खोजें',
      searchMedicine: 'दवा खोजें'
    },

    login: {
      missingFields: 'जानकारी अधूरी है',
      enterCredentials: 'कृपया ईमेल और पासवर्ड दर्ज करें',
      success: 'सफलता',
      welcome: 'स्वागत है {{name}}',
      loginFailed: 'लॉगिन विफल',
      somethingWrong: 'कुछ गलत हो गया',
      email: 'ईमेल',
      password: 'पासवर्ड',
      login: 'लॉगिन',
      registerPrompt: 'खाता नहीं है? रजिस्टर करें',
      subtitle: 'दवाइयाँ खोजें और पास की फार्मेसी खोजें'
    },

    profile: {
      title: 'प्रोफ़ाइल',
      subtitle: 'अपनी व्यक्तिगत स्वास्थ्य जानकारी प्रबंधित करें',
      edit: 'प्रोफ़ाइल संपादित करें',
      editProfile: 'प्रोफ़ाइल संपादित करें',
      updateInformation: 'जानकारी अपडेट करें',
      saveChanges: 'परिवर्तन सहेजें',
      logout: 'लॉगआउट',
      language: 'भाषा',
      localStorageInfo:
        'आपकी प्रोफ़ाइल जानकारी आपके डिवाइस पर स्थानीय रूप से संग्रहीत है।',
      stored:
        'आपकी प्रोफ़ाइल जानकारी आपके डिवाइस पर स्थानीय रूप से संग्रहीत है।',
      updated: 'प्रोफ़ाइल अपडेट हुई',
      saved: 'आपकी प्रोफ़ाइल सफलतापूर्वक सेव हो गई है।',
      error: 'त्रुटि',
      logoutFailed: 'लॉगआउट विफल रहा',
      name: 'नाम',
      age: 'आयु',
      year: 'वर्ष',
      height: 'ऊँचाई',
      weight: 'वजन',
      cm: 'सेमी',
      kg: 'किग्रा',
      bmi: 'BMI',
      bmr: 'BMR',
      calPerDay: 'कैलोरी/दिन',
      gender: 'लिंग',
      genderOptions: {
        male: 'पुरुष',
        female: 'महिला',
        other: 'अन्य',
        'prefer not to say': 'कहना पसंद नहीं'
      }
    },

    reminder: {
      title: 'रिमाइंडर',
      medicineName: 'दवा का नाम',
      selectTime: 'समय चुनें',
      breakfast: 'नाश्ता',
      lunch: 'दोपहर का भोजन',
      dinner: 'रात का खाना',
      custom: 'कस्टम',

      beforeAfterFood: 'भोजन से पहले / बाद',
      before: 'पहले',
      after: 'बाद',
      beforeFood: 'भोजन से पहले',
      afterFood: 'भोजन के बाद',

      reminderOffset: 'रिमाइंडर अंतराल',
      min: 'मिनट',

      endDateOptional: 'अंतिम तिथि (वैकल्पिक)',
      selectEndDate: 'अंतिम तिथि चुनें',

      saveReminder: 'रिमाइंडर सेव करें',

      reminders: 'रिमाइंडर',
      noRemindersYet: 'अभी कोई रिमाइंडर नहीं है।',
      unknown: 'अज्ञात',

      daily: 'दैनिक',
      oneTime: 'एक बार',
      ends: 'समाप्त:',
      status: 'स्थिति:',

      pending: 'लंबित',
      taken: 'लिया गया',
      missed: 'छूट गया',

      medicineReminder: 'दवा रिमाइंडर',
      medicineReminders: 'दवा रिमाइंडर',
      take: 'लें',

      missingField: 'जानकारी अधूरी है',
      enterMedicine: 'कृपया दवा का नाम दर्ज करें।',

      invalidTime: 'अमान्य समय',
      selectValidTime: 'कृपया मान्य रिमाइंडर समय चुनें।',

      invalidEndDate: 'अमान्य अंतिम तिथि',
      endDateFuture: 'अंतिम तिथि आज या भविष्य की होनी चाहिए।',

      reminderSaved: 'रिमाइंडर सेव हो गया',
      scheduled: 'आपका दवा रिमाइंडर निर्धारित कर दिया गया है।',
      savedNoNotifications:
        'आपका रिमाइंडर सेव हो गया है, लेकिन वर्तमान वातावरण में नोटिफिकेशन उपलब्ध नहीं हैं।',

      storageError: 'स्टोरेज त्रुटि',
      unableToSave: 'आपका रिमाइंडर सेव नहीं किया जा सका।',

      noReminders: 'कोई रिमाइंडर नहीं',
      noRemindersToShare: 'साझा करने के लिए कोई रिमाइंडर नहीं है।',

      myMedicineReminders: 'मेरे दवा रिमाइंडर',

      shareFailed: 'साझा करना विफल',
      unableToShare: 'रिमाइंडर साझा नहीं किए जा सके।'
    },

    maps: {
      title: 'मानचित्र',
      subtitle: 'आपके वर्तमान स्थान के पास की फार्मेसियाँ',
      gettingLocation: 'आपका स्थान प्राप्त किया जा रहा है...',
      loadingShops: 'पास की मेडिकल दुकानों को लोड किया जा रहा है...',
      medicalShop: 'मेडिकल दुकान',
      pharmacy: 'फार्मेसी',
      pharmacyNearby: 'पास की फार्मेसी',
      addressNotAvailable: 'पता उपलब्ध नहीं है',
      permissionRequired: 'अनुमति आवश्यक',
      locationPermission: 'स्थान की अनुमति आवश्यक है।',
      fetchError: 'पास की मेडिकल दुकानें प्राप्त नहीं की जा सकीं।',
      locationError: 'स्थान प्राप्त नहीं किया जा सका।',
      openMapsError: 'मैप्स ऐप नहीं खोला जा सका।',
      directionsTo: '{{name}} के लिए दिशा-निर्देश'
    },

    medicine: {
      search: 'दवा खोजें',
      searchPlaceholder: 'दवा का नाम दर्ज करें',
      suggestions: 'सुझाव',
      history: 'खोज इतिहास',
      clearHistory: 'इतिहास साफ़ करें',
      details: 'दवा की जानकारी',
      substitutes: 'सुझाई गई वैकल्पिक दवाएँ',
      price: 'कीमत',
      close: 'बंद करें',
      noResults: 'कोई दवा नहीं मिली।'
    },

    med: {
      medicalEnquiry: 'चिकित्सीय पूछताछ',
      tabletName: 'टैबलेट का नाम',
      enterTabletName: 'टैबलेट का नाम दर्ज करें',
      search: 'खोजें',
      searchHistory: 'खोज इतिहास',
      noHistory: 'अभी तक कोई इतिहास नहीं',
      suggested: 'सुझावित',

      manufacturer: 'निर्माता',
      price: 'कीमत',
      type: 'प्रकार',
      packaging: 'पैकेजिंग',
      composition1: 'संयोजन 1',
      composition2: 'संयोजन 2',
      sideEffects: 'दुष्प्रभाव',
      use: 'उपयोग',
      chemicalClass: 'रासायनिक वर्ग',
      habitForming: 'आदत लगने वाला',
      therapeuticClass: 'चिकित्सीय वर्ग',
      actionClass: 'क्रिया वर्ग',
      close: 'बंद करें'
    },

    common: {
      cancel: 'रद्द करें',
      close: 'बंद करें',
      done: 'हो गया',
      save: 'सहेजें',
      delete: 'हटाएँ',
      edit: 'संपादित करें',
      error: 'त्रुटि',
      success: 'सफलता',
      loading: 'लोड हो रहा है...',
      retry: 'पुनः प्रयास करें',
      yes: 'हाँ',
      no: 'नहीं'
    }
  },

  // =======================================================
  // BENGALI
  // =======================================================

  bn: {
    app: {
      selectLanguage: 'ভাষা নির্বাচন করুন',
      language: 'ভাষা',
      done: 'সম্পন্ন',
      chooseLanguage: 'আপনার পছন্দের ভাষা নির্বাচন করুন',
      changeAnytime:
        'আপনি হোম স্ক্রিন থেকে যেকোনো সময় ভাষা পরিবর্তন করতে পারেন।'
    },

    tabs: {
      home: 'হোম',
      maps: 'মানচিত্র',
      reminder: 'রিমাইন্ডার',
      profile: 'প্রোফাইল'
    },

    home: {
      title: 'হোম স্ক্রিন',
      subtitle: 'ওষুধ খুঁজুন এবং কাছের ফার্মেসি খুঁজুন',
      searchMedicine: 'ওষুধ খুঁজুন'
    },

    login: {
      missingFields: 'তথ্য অসম্পূর্ণ',
      enterCredentials: 'ইমেল ও পাসওয়ার্ড দিন',
      success: 'সফল',
      welcome: 'স্বাগতম {{name}}',
      loginFailed: 'লগইন ব্যর্থ',
      somethingWrong: 'কিছু ভুল হয়েছে',
      email: 'ইমেল',
      password: 'পাসওয়ার্ড',
      login: 'লগইন',
      registerPrompt: 'অ্যাকাউন্ট নেই? রেজিস্টার করুন',
      subtitle: 'ওষুধ খুঁজুন এবং কাছের ফার্মেসি খুঁজুন'
    },

    profile: {
      title: 'প্রোফাইল',
      subtitle: 'আপনার ব্যক্তিগত স্বাস্থ্য তথ্য পরিচালনা করুন',
      edit: 'প্রোফাইল সম্পাদনা',
      editProfile: 'প্রোফাইল সম্পাদনা করুন',
      updateInformation: 'তথ্য আপডেট করুন',
      saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
      logout: 'লগআউট',
      language: 'ভাষা',
      localStorageInfo:
        'আপনার প্রোফাইল তথ্য আপনার ডিভাইসে স্থানীয়ভাবে সংরক্ষিত।',
      stored: 'আপনার প্রোফাইল তথ্য আপনার ডিভাইসে স্থানীয়ভাবে সংরক্ষিত।',
      updated: 'প্রোফাইল আপডেট হয়েছে',
      saved: 'আপনার প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে।',
      error: 'ত্রুটি',
      logoutFailed: 'লগআউট ব্যর্থ হয়েছে',
      name: 'নাম',
      age: 'বয়স',
      year: 'বছর',
      height: 'উচ্চতা',
      weight: 'ওজন',
      cm: 'সেমি',
      kg: 'কেজি',
      bmi: 'BMI',
      bmr: 'BMR',
      calPerDay: 'ক্যালোরি/দিন',
      gender: 'লিঙ্গ',
      genderOptions: {
        male: 'পুরুষ',
        female: 'মহিলা',
        other: 'অন্যান্য',
        'prefer not to say': 'বলতে পছন্দ করি না'
      }
    },

    reminder: {
      title: 'রিমাইন্ডার',
      medicineName: 'ওষুধের নাম',
      selectTime: 'সময় নির্বাচন করুন',
      breakfast: 'সকালের নাস্তা',
      lunch: 'দুপুরের খাবার',
      dinner: 'রাতের খাবার',
      custom: 'কাস্টম',

      beforeAfterFood: 'খাবারের আগে / পরে',
      before: 'আগে',
      after: 'পরে',
      beforeFood: 'খাবারের আগে',
      afterFood: 'খাবারের পরে',

      reminderOffset: 'রিমাইন্ডার সময়ের ব্যবধান',
      min: 'মিনিট',

      endDateOptional: 'শেষ তারিখ (ঐচ্ছিক)',
      selectEndDate: 'শেষ তারিখ নির্বাচন করুন',

      saveReminder: 'রিমাইন্ডার সংরক্ষণ করুন',

      reminders: 'রিমাইন্ডার',
      noRemindersYet: 'এখনও কোনো রিমাইন্ডার নেই।',
      unknown: 'অজানা',

      daily: 'দৈনিক',
      oneTime: 'একবার',
      ends: 'শেষ:',
      status: 'অবস্থা:',

      pending: 'অপেক্ষমাণ',
      taken: 'নেওয়া হয়েছে',
      missed: 'মিস হয়েছে',

      medicineReminder: 'ওষুধের রিমাইন্ডার',
      medicineReminders: 'ওষুধের রিমাইন্ডার',
      take: 'নিন',

      missingField: 'তথ্য অসম্পূর্ণ',
      enterMedicine: 'অনুগ্রহ করে ওষুধের নাম লিখুন।',

      invalidTime: 'অবৈধ সময়',
      selectValidTime: 'অনুগ্রহ করে একটি বৈধ রিমাইন্ডার সময় নির্বাচন করুন।',

      invalidEndDate: 'অবৈধ শেষ তারিখ',
      endDateFuture: 'শেষ তারিখ আজ অথবা ভবিষ্যতের তারিখ হতে হবে।',

      reminderSaved: 'রিমাইন্ডার সংরক্ষিত হয়েছে',
      scheduled: 'আপনার ওষুধের রিমাইন্ডার নির্ধারিত হয়েছে।',
      savedNoNotifications:
        'আপনার রিমাইন্ডার সংরক্ষিত হয়েছে, তবে বর্তমান পরিবেশে নোটিফিকেশন উপলব্ধ নয়।',

      storageError: 'স্টোরেজ ত্রুটি',
      unableToSave: 'আপনার রিমাইন্ডার সংরক্ষণ করা যায়নি।',

      noReminders: 'কোনো রিমাইন্ডার নেই',
      noRemindersToShare: 'শেয়ার করার জন্য কোনো রিমাইন্ডার নেই।',

      myMedicineReminders: 'আমার ওষুধের রিমাইন্ডার',

      shareFailed: 'শেয়ার ব্যর্থ',
      unableToShare: 'রিমাইন্ডার শেয়ার করা যায়নি।'
    },

    maps: {
      title: 'মানচিত্র',
      subtitle: 'আপনার বর্তমান অবস্থানের কাছের ফার্মেসি',
      gettingLocation: 'আপনার অবস্থান পাওয়া হচ্ছে...',
      loadingShops: 'কাছের মেডিকেল দোকান লোড হচ্ছে...',
      medicalShop: 'মেডিকেল দোকান',
      pharmacy: 'ফার্মেসি',
      pharmacyNearby: 'কাছের ফার্মেসি',
      addressNotAvailable: 'ঠিকানা পাওয়া যায়নি',
      permissionRequired: 'অনুমতি প্রয়োজন',
      locationPermission: 'লোকেশন অনুমতি প্রয়োজন।',
      fetchError: 'কাছের মেডিকেল দোকান পাওয়া যায়নি।',
      locationError: 'লোকেশন পাওয়া যায়নি।',
      openMapsError: 'ম্যাপস অ্যাপ খোলা যায়নি।',
      directionsTo: '{{name}}-এর জন্য দিকনির্দেশ'
    },

    medicine: {
      search: 'ওষুধ খুঁজুন',
      searchPlaceholder: 'ওষুধের নাম লিখুন',
      suggestions: 'পরামর্শ',
      history: 'অনুসন্ধানের ইতিহাস',
      clearHistory: 'ইতিহাস পরিষ্কার করুন',
      details: 'ওষুধের তথ্য',
      substitutes: 'প্রস্তাবিত বিকল্প ওষুধ',
      price: 'মূল্য',
      close: 'বন্ধ করুন',
      noResults: 'কোনো ওষুধ পাওয়া যায়নি।'
    },

    med: {
      medicalEnquiry: 'চিকিৎসা সংক্রান্ত অনুসন্ধান',
      tabletName: 'ট্যাবলেটের নাম',
      enterTabletName: 'ট্যাবলেটের নাম লিখুন',
      search: 'অনুসন্ধান করুন',
      searchHistory: 'অনুসন্ধানের ইতিহাস',
      noHistory: 'এখনও কোনো ইতিহাস নেই',
      suggested: 'প্রস্তাবিত',

      manufacturer: 'প্রস্তুতকারক',
      price: 'মূল্য',
      type: 'ধরন',
      packaging: 'প্যাকেজিং',
      composition1: 'উপাদান ১',
      composition2: 'উপাদান ২',
      sideEffects: 'পার্শ্বপ্রতিক্রিয়া',
      use: 'ব্যবহার',
      chemicalClass: 'রাসায়নিক শ্রেণি',
      habitForming: 'অভ্যাস তৈরি করে',
      therapeuticClass: 'চিকিৎসাগত শ্রেণি',
      actionClass: 'কার্যপ্রণালী শ্রেণি',
      close: 'বন্ধ করুন'
    },

    common: {
      cancel: 'বাতিল',
      close: 'বন্ধ',
      done: 'সম্পন্ন',
      save: 'সংরক্ষণ করুন',
      delete: 'মুছে ফেলুন',
      edit: 'সম্পাদনা',
      error: 'ত্রুটি',
      success: 'সফল',
      loading: 'লোড হচ্ছে...',
      retry: 'আবার চেষ্টা করুন',
      yes: 'হ্যাঁ',
      no: 'না'
    }
  },

  // =======================================================
  // TAMIL
  // =======================================================

  ta: {
    app: {
      selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
      language: 'மொழி',
      done: 'முடிந்தது',
      chooseLanguage: 'உங்களுக்கு விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
      changeAnytime:
        'முகப்புத் திரையில் இருந்து எப்போது வேண்டுமானாலும் மொழியை மாற்றலாம்.'
    },

    tabs: {
      home: 'முகப்பு',
      maps: 'வரைபடம்',
      reminder: 'நினைவூட்டல்',
      profile: 'சுயவிவரம்'
    },

    home: {
      title: 'முகப்புத் திரை',
      subtitle: 'மருந்துகளைத் தேடி அருகிலுள்ள மருந்தகங்களைக் கண்டறியுங்கள்',
      searchMedicine: 'மருந்தைத் தேடுங்கள்'
    },

    login: {
      missingFields: 'தகவல்கள் இல்லை',
      enterCredentials: 'மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்',
      success: 'வெற்றி',
      welcome: 'வரவேற்கிறோம் {{name}}',
      loginFailed: 'உள்நுழைவு தோல்வி',
      somethingWrong: 'ஏதோ தவறு ஏற்பட்டது',
      email: 'மின்னஞ்சல்',
      password: 'கடவுச்சொல்',
      login: 'உள்நுழை',
      registerPrompt: 'கணக்கு இல்லையா? பதிவு செய்யுங்கள்',
      subtitle: 'மருந்துகளைத் தேடி அருகிலுள்ள மருந்தகங்களைக் கண்டறியுங்கள்'
    },

    profile: {
      title: 'சுயவிவரம்',
      subtitle: 'உங்கள் தனிப்பட்ட சுகாதாரத் தகவலை நிர்வகிக்கவும்',
      edit: 'சுயவிவரத்தைத் திருத்து',
      editProfile: 'சுயவிவரத்தைத் திருத்து',
      updateInformation: 'தகவலைப் புதுப்பிக்கவும்',
      saveChanges: 'மாற்றங்களைச் சேமிக்கவும்',
      logout: 'வெளியேறு',
      language: 'மொழி',
      localStorageInfo:
        'உங்கள் சுயவிவரத் தகவல் சாதனத்தில் சேமிக்கப்பட்டுள்ளது.',
      stored: 'உங்கள் சுயவிவரத் தகவல் சாதனத்தில் சேமிக்கப்பட்டுள்ளது.',
      updated: 'சுயவிவரம் புதுப்பிக்கப்பட்டது',
      saved: 'உங்கள் சுயவிவரம் வெற்றிகரமாகச் சேமிக்கப்பட்டது.',
      error: 'பிழை',
      logoutFailed: 'வெளியேற முடியவில்லை',
      name: 'பெயர்',
      age: 'வயது',
      year: 'ஆண்டு',
      height: 'உயரம்',
      weight: 'எடை',
      cm: 'செ.மீ',
      kg: 'கி.கி',
      bmi: 'BMI',
      bmr: 'BMR',
      calPerDay: 'கலோரி/நாள்',
      gender: 'பாலினம்',
      genderOptions: {
        male: 'ஆண்',
        female: 'பெண்',
        other: 'மற்றவை',
        'prefer not to say': 'சொல்ல விரும்பவில்லை'
      }
    },

    reminder: {
      title: 'நினைவூட்டல்',
      medicineName: 'மருந்தின் பெயர்',
      selectTime: 'நேரத்தைத் தேர்ந்தெடுக்கவும்',
      breakfast: 'காலை உணவு',
      lunch: 'மதிய உணவு',
      dinner: 'இரவு உணவு',
      custom: 'தனிப்பயன்',

      beforeAfterFood: 'உணவுக்கு முன் / பின்',
      before: 'முன்',
      after: 'பின்',
      beforeFood: 'உணவுக்கு முன்',
      afterFood: 'உணவுக்குப் பின்',

      reminderOffset: 'நினைவூட்டல் இடைவெளி',
      min: 'நிமி',

      endDateOptional: 'முடிவு தேதி (விருப்பத்தேர்வு)',
      selectEndDate: 'முடிவு தேதியைத் தேர்ந்தெடுக்கவும்',

      saveReminder: 'நினைவூட்டலைச் சேமிக்கவும்',

      reminders: 'நினைவூட்டல்கள்',
      noRemindersYet: 'இதுவரை நினைவூட்டல்கள் இல்லை.',
      unknown: 'தெரியவில்லை',

      daily: 'தினசரி',
      oneTime: 'ஒருமுறை',
      ends: 'முடிவு:',
      status: 'நிலை:',

      pending: 'நிலுவையில்',
      taken: 'எடுக்கப்பட்டது',
      missed: 'தவறவிட்டது',

      medicineReminder: 'மருந்து நினைவூட்டல்',
      medicineReminders: 'மருந்து நினைவூட்டல்கள்',
      take: 'எடுக்கவும்',

      missingField: 'தகவல் இல்லை',
      enterMedicine: 'மருந்தின் பெயரை உள்ளிடவும்.',

      invalidTime: 'தவறான நேரம்',
      selectValidTime: 'சரியான நினைவூட்டல் நேரத்தைத் தேர்ந்தெடுக்கவும்.',

      invalidEndDate: 'தவறான முடிவு தேதி',
      endDateFuture:
        'முடிவு தேதி இன்றைய தேதி அல்லது எதிர்கால தேதியாக இருக்க வேண்டும்.',

      reminderSaved: 'நினைவூட்டல் சேமிக்கப்பட்டது',
      scheduled: 'உங்கள் மருந்து நினைவூட்டல் திட்டமிடப்பட்டுள்ளது.',
      savedNoNotifications:
        'உங்கள் நினைவூட்டல் சேமிக்கப்பட்டது, ஆனால் தற்போதைய சூழலில் அறிவிப்புகள் கிடைக்கவில்லை.',

      storageError: 'சேமிப்பு பிழை',
      unableToSave: 'உங்கள் நினைவூட்டலைச் சேமிக்க முடியவில்லை.',

      noReminders: 'நினைவூட்டல்கள் இல்லை',
      noRemindersToShare: 'பகிர எந்த நினைவூட்டலும் இல்லை.',

      myMedicineReminders: 'எனது மருந்து நினைவூட்டல்கள்',

      shareFailed: 'பகிர்வு தோல்வியடைந்தது',
      unableToShare: 'நினைவூட்டல்களைப் பகிர முடியவில்லை.'
    },

    maps: {
      title: 'வரைபடம்',
      subtitle: 'உங்கள் தற்போதைய இருப்பிடத்திற்கு அருகிலுள்ள மருந்தகங்கள்',
      gettingLocation: 'உங்கள் இருப்பிடம் பெறப்படுகிறது...',
      loadingShops: 'அருகிலுள்ள மருத்துவக் கடைகள் ஏற்றப்படுகின்றன...',
      medicalShop: 'மருத்துவக் கடை',
      pharmacy: 'மருந்தகம்',
      pharmacyNearby: 'அருகிலுள்ள மருந்தகம்',
      addressNotAvailable: 'முகவரி கிடைக்கவில்லை',
      permissionRequired: 'அனுமதி தேவை',
      locationPermission: 'இருப்பிட அனுமதி தேவை.',
      fetchError: 'அருகிலுள்ள மருத்துவக் கடைகளைப் பெற முடியவில்லை.',
      locationError: 'இருப்பிடத்தைப் பெற முடியவில்லை.',
      openMapsError: 'வரைபட பயன்பாட்டைத் திறக்க முடியவில்லை.',
      directionsTo: '{{name}}-க்கான வழிகாட்டுதல்'
    },

    medicine: {
      search: 'மருந்தைத் தேடுங்கள்',
      searchPlaceholder: 'மருந்தின் பெயரை உள்ளிடவும்',
      suggestions: 'பரிந்துரைகள்',
      history: 'தேடல் வரலாறு',
      clearHistory: 'வரலாற்றை அழிக்கவும்',
      details: 'மருந்து விவரங்கள்',
      substitutes: 'பரிந்துரைக்கப்பட்ட மாற்று மருந்துகள்',
      price: 'விலை',
      close: 'மூடு',
      noResults: 'மருந்து எதுவும் கிடைக்கவில்லை.'
    },

    med: {
      medicalEnquiry: 'மருத்துவ விசாரணை',
      tabletName: 'மாத்திரையின் பெயர்',
      enterTabletName: 'மாத்திரையின் பெயரை உள்ளிடவும்',
      search: 'தேடுங்கள்',
      searchHistory: 'தேடல் வரலாறு',
      noHistory: 'இதுவரை வரலாறு இல்லை',
      suggested: 'பரிந்துரைக்கப்பட்டது',

      manufacturer: 'உற்பத்தியாளர்',
      price: 'விலை',
      type: 'வகை',
      packaging: 'பேக்கேஜிங்',
      composition1: 'கூறுகள் 1',
      composition2: 'கூறுகள் 2',
      sideEffects: 'பக்க விளைவுகள்',
      use: 'பயன்பாடு',
      chemicalClass: 'வேதியியல் வகுப்பு',
      habitForming: 'பழக்கத்தை ஏற்படுத்தும்',
      therapeuticClass: 'சிகிச்சை வகுப்பு',
      actionClass: 'செயல் வகுப்பு',
      close: 'மூடு'
    },

    common: {
      cancel: 'ரத்து',
      close: 'மூடு',
      done: 'முடிந்தது',
      save: 'சேமி',
      delete: 'நீக்கு',
      edit: 'திருத்து',
      error: 'பிழை',
      success: 'வெற்றி',
      loading: 'ஏற்றப்படுகிறது...',
      retry: 'மீண்டும் முயற்சிக்கவும்',
      yes: 'ஆம்',
      no: 'இல்லை'
    }
  },

  // =======================================================
  // TELUGU
  // =======================================================

  te: {
    app: {
      selectLanguage: 'భాషను ఎంచుకోండి',
      language: 'భాష',
      done: 'పూర్తయింది',
      chooseLanguage: 'మీకు ఇష్టమైన భాషను ఎంచుకోండి',
      changeAnytime: 'హోమ్ స్క్రీన్ నుండి ఎప్పుడైనా భాషను మార్చవచ్చు.'
    },

    tabs: {
      home: 'హోమ్',
      maps: 'మ్యాప్స్',
      reminder: 'రిమైండర్',
      profile: 'ప్రొఫైల్'
    },

    home: {
      title: 'హోమ్ స్క్రీన్',
      subtitle: 'మందులను వెతికి సమీప ఫార్మసీలను కనుగొనండి',
      searchMedicine: 'మందును వెతకండి'
    },

    login: {
      missingFields: 'వివరాలు లేవు',
      enterCredentials: 'ఇమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి',
      success: 'విజయం',
      welcome: 'స్వాగతం {{name}}',
      loginFailed: 'లాగిన్ విఫలమైంది',
      somethingWrong: 'ఏదో తప్పు జరిగింది',
      email: 'ఇమెయిల్',
      password: 'పాస్‌వర్డ్',
      login: 'లాగిన్',
      registerPrompt: 'ఖాతా లేదా? నమోదు చేసుకోండి',
      subtitle: 'మందులను వెతికి సమీప ఫార్మసీలను కనుగొనండి'
    },

    profile: {
      title: 'ప్రొఫైల్',
      subtitle: 'మీ వ్యక్తిగత ఆరోగ్య సమాచారాన్ని నిర్వహించండి',
      edit: 'ప్రొఫైల్ సవరించు',
      editProfile: 'ప్రొఫైల్ సవరించు',
      updateInformation: 'సమాచారాన్ని నవీకరించండి',
      saveChanges: 'మార్పులను సేవ్ చేయండి',
      logout: 'లాగ్ అవుట్',
      language: 'భాష',
      localStorageInfo:
        'మీ ప్రొఫైల్ సమాచారం మీ పరికరంలో స్థానికంగా నిల్వ చేయబడింది.',
      stored: 'మీ ప్రొఫైల్ సమాచారం మీ పరికరంలో స్థానికంగా నిల్వ చేయబడింది.',
      updated: 'ప్రొఫైల్ నవీకరించబడింది',
      saved: 'మీ ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది.',
      error: 'లోపం',
      logoutFailed: 'లాగ్ అవుట్ విఫలమైంది',
      name: 'పేరు',
      age: 'వయస్సు',
      year: 'సంవత్సరం',
      height: 'ఎత్తు',
      weight: 'బరువు',
      cm: 'సెం.మీ',
      kg: 'కిలోలు',
      bmi: 'BMI',
      bmr: 'BMR',
      calPerDay: 'కేలరీలు/రోజు',
      gender: 'లింగం',
      genderOptions: {
        male: 'పురుషుడు',
        female: 'స్త్రీ',
        other: 'ఇతర',
        'prefer not to say': 'చెప్పడానికి ఇష్టపడను'
      }
    },

    reminder: {
      title: 'రిమైండర్',
      medicineName: 'మందు పేరు',
      selectTime: 'సమయాన్ని ఎంచుకోండి',
      breakfast: 'అల్పాహారం',
      lunch: 'మధ్యాహ్న భోజనం',
      dinner: 'రాత్రి భోజనం',
      custom: 'కస్టమ్',

      beforeAfterFood: 'ఆహారానికి ముందు / తర్వాత',
      before: 'ముందు',
      after: 'తర్వాత',
      beforeFood: 'ఆహారానికి ముందు',
      afterFood: 'ఆహారం తర్వాత',

      reminderOffset: 'రిమైండర్ విరామం',
      min: 'నిమి',

      endDateOptional: 'ముగింపు తేదీ (ఐచ్ఛికం)',
      selectEndDate: 'ముగింపు తేదీని ఎంచుకోండి',

      saveReminder: 'రిమైండర్ సేవ్ చేయండి',

      reminders: 'రిమైండర్లు',
      noRemindersYet: 'ఇంకా రిమైండర్లు లేవు.',
      unknown: 'తెలియదు',

      daily: 'రోజువారీ',
      oneTime: 'ఒక్కసారి',
      ends: 'ముగింపు:',
      status: 'స్థితి:',

      pending: 'పెండింగ్',
      taken: 'తీసుకున్నారు',
      missed: 'మిస్ అయింది',

      medicineReminder: 'మందు రిమైండర్',
      medicineReminders: 'మందు రిమైండర్లు',
      take: 'తీసుకోండి',

      missingField: 'వివరాలు లేవు',
      enterMedicine: 'దయచేసి మందు పేరు నమోదు చేయండి.',

      invalidTime: 'చెల్లని సమయం',
      selectValidTime: 'దయచేసి చెల్లుబాటు అయ్యే రిమైండర్ సమయాన్ని ఎంచుకోండి.',

      invalidEndDate: 'చెల్లని ముగింపు తేదీ',
      endDateFuture: 'ముగింపు తేదీ ఈరోజు లేదా భవిష్యత్ తేదీగా ఉండాలి.',

      reminderSaved: 'రిమైండర్ సేవ్ చేయబడింది',
      scheduled: 'మీ మందు రిమైండర్ షెడ్యూల్ చేయబడింది.',
      savedNoNotifications:
        'మీ రిమైండర్ సేవ్ చేయబడింది, కానీ ప్రస్తుత వాతావరణంలో నోటిఫికేషన్లు అందుబాటులో లేవు.',

      storageError: 'స్టోరేజ్ లోపం',
      unableToSave: 'మీ రిమైండర్‌ను సేవ్ చేయడం సాధ్యం కాలేదు.',

      noReminders: 'రిమైండర్లు లేవు',
      noRemindersToShare: 'షేర్ చేయడానికి రిమైండర్లు లేవు.',

      myMedicineReminders: 'నా మందు రిమైండర్లు',

      shareFailed: 'షేర్ విఫలమైంది',
      unableToShare: 'రిమైండర్లను షేర్ చేయడం సాధ్యం కాలేదు.'
    },

    maps: {
      title: 'మ్యాప్స్',
      subtitle: 'మీ ప్రస్తుత స్థానానికి సమీపంలోని ఫార్మసీలు',
      gettingLocation: 'మీ స్థానాన్ని పొందుతోంది...',
      loadingShops: 'సమీపంలోని మెడికల్ షాపులను లోడ్ చేస్తోంది...',
      medicalShop: 'మెడికల్ షాప్',
      pharmacy: 'ఫార్మసీ',
      pharmacyNearby: 'సమీప ఫార్మసీ',
      addressNotAvailable: 'చిరునామా అందుబాటులో లేదు',
      permissionRequired: 'అనుమతి అవసరం',
      locationPermission: 'లొకేషన్ అనుమతి అవసరం.',
      fetchError: 'సమీపంలోని మెడికల్ షాపులను పొందలేకపోయాము.',
      locationError: 'స్థానాన్ని పొందలేకపోయాము.',
      openMapsError: 'మ్యాప్స్ యాప్‌ను తెరవలేకపోయాము.',
      directionsTo: '{{name}} కు దిశలు'
    },

    medicine: {
      search: 'మందును వెతకండి',
      searchPlaceholder: 'మందు పేరు నమోదు చేయండి',
      suggestions: 'సూచనలు',
      history: 'శోధన చరిత్ర',
      clearHistory: 'చరిత్రను క్లియర్ చేయండి',
      details: 'మందు వివరాలు',
      substitutes: 'సూచించిన ప్రత్యామ్నాయ మందులు',
      price: 'ధర',
      close: 'మూసివేయి',
      noResults: 'మందు కనుగొనబడలేదు.'
    },

    med: {
      medicalEnquiry: 'వైద్య విచారణ',
      tabletName: 'టాబ్లెట్ పేరు',
      enterTabletName: 'టాబ్లెట్ పేరు నమోదు చేయండి',
      search: 'శోధించండి',
      searchHistory: 'శోధన చరిత్ర',
      noHistory: 'ఇంకా చరిత్ర లేదు',
      suggested: 'సూచించబడినవి',

      manufacturer: 'తయారీదారు',
      price: 'ధర',
      type: 'రకం',
      packaging: 'ప్యాకేజింగ్',
      composition1: 'కూర్పు 1',
      composition2: 'కూర్పు 2',
      sideEffects: 'దుష్ప్రభావాలు',
      use: 'ఉపయోగం',
      chemicalClass: 'రసాయన తరగతి',
      habitForming: 'అలవాటు కలిగించేది',
      therapeuticClass: 'చికిత్సా తరగతి',
      actionClass: 'చర్య తరగతి',
      close: 'మూసివేయి'
    },

    common: {
      cancel: 'రద్దు',
      close: 'మూసివేయి',
      done: 'పూర్తయింది',
      save: 'సేవ్ చేయండి',
      delete: 'తొలగించు',
      edit: 'సవరించు',
      error: 'లోపం',
      success: 'విజయం',
      loading: 'లోడ్ అవుతోంది...',
      retry: 'మళ్లీ ప్రయత్నించండి',
      yes: 'అవును',
      no: 'కాదు'
    }
  },

  // =======================================================
  // KANNADA
  // =======================================================

  kn: {
    app: {
      selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      language: 'ಭಾಷೆ',
      done: 'ಮುಗಿದಿದೆ',
      chooseLanguage: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      changeAnytime: 'ಮುಖಪುಟದಿಂದ ಯಾವಾಗ ಬೇಕಾದರೂ ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಬಹುದು.'
    },

    tabs: {
      home: 'ಮುಖಪುಟ',
      maps: 'ನಕ್ಷೆಗಳು',
      reminder: 'ಜ್ಞಾಪನೆ',
      profile: 'ಪ್ರೊಫೈಲ್'
    },

    home: {
      title: 'ಮುಖಪುಟ ಪರದೆ',
      subtitle: 'ಔಷಧಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ಹತ್ತಿರದ ಔಷಧಾಲಯಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ',
      searchMedicine: 'ಔಷಧ ಹುಡುಕಿ'
    },

    login: {
      missingFields: 'ಮಾಹಿತಿ ಅಗತ್ಯ',
      enterCredentials: 'ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ',
      success: 'ಯಶಸ್ಸು',
      welcome: 'ಸ್ವಾಗತ {{name}}',
      loginFailed: 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ',
      somethingWrong: 'ಏನೋ ತಪ್ಪಾಗಿದೆ',
      email: 'ಇಮೇಲ್',
      password: 'ಪಾಸ್‌ವರ್ಡ್',
      login: 'ಲಾಗಿನ್',
      registerPrompt: 'ಖಾತೆ ಇಲ್ಲವೇ? ನೋಂದಾಯಿಸಿ',
      subtitle: 'ಔಷಧಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ಹತ್ತಿರದ ಔಷಧಾಲಯಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ'
    },

    profile: {
      title: 'ಪ್ರೊಫೈಲ್',
      subtitle: 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ನಿರ್ವಹಿಸಿ',

      edit: 'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ',
      editProfile: 'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ',
      updateInformation: 'ಮಾಹಿತಿಯನ್ನು ನವೀಕರಿಸಿ',
      saveChanges: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
      logout: 'ಲಾಗ್ ಔಟ್',
      language: 'ಭಾಷೆ',

      localStorageInfo:
        'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿ ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಸ್ಥಳೀಯವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ.',
      stored:
        'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿ ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಸ್ಥಳೀಯವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ.',

      updated: 'ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಲಾಗಿದೆ',
      saved: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.',
      error: 'ದೋಷ',
      logoutFailed: 'ಲಾಗ್ ಔಟ್ ವಿಫಲವಾಗಿದೆ',

      name: 'ಹೆಸರು',
      age: 'ವಯಸ್ಸು',
      year: 'ವರ್ಷ',
      height: 'ಎತ್ತರ',
      weight: 'ತೂಕ',
      cm: 'ಸೆಂ.ಮೀ',
      kg: 'ಕೆ.ಜಿ',

      bmi: 'BMI',
      bmr: 'BMR',
      calPerDay: 'ಕ್ಯಾಲೊರಿ/ದಿನ',

      gender: 'ಲಿಂಗ',

      genderOptions: {
        male: 'ಪುರುಷ',
        female: 'ಮಹಿಳೆ',
        other: 'ಇತರೆ',
        'prefer not to say': 'ಹೇಳಲು ಇಷ್ಟವಿಲ್ಲ'
      }
    },

    reminder: {
      title: 'ಜ್ಞಾಪನೆ',
      medicineName: 'ಔಷಧದ ಹೆಸರು',
      selectTime: 'ಸಮಯ ಆಯ್ಕೆಮಾಡಿ',
      breakfast: 'ಉಪಾಹಾರ',
      lunch: 'ಮಧ್ಯಾಹ್ನದ ಊಟ',
      dinner: 'ರಾತ್ರಿ ಊಟ',
      custom: 'ಕಸ್ಟಮ್',

      beforeAfterFood: 'ಆಹಾರಕ್ಕೆ ಮೊದಲು / ನಂತರ',
      before: 'ಮೊದಲು',
      after: 'ನಂತರ',
      beforeFood: 'ಆಹಾರಕ್ಕೆ ಮೊದಲು',
      afterFood: 'ಆಹಾರದ ನಂತರ',

      reminderOffset: 'ಜ್ಞಾಪನೆ ಅಂತರ',
      min: 'ನಿಮಿ',

      endDateOptional: 'ಅಂತಿಮ ದಿನಾಂಕ (ಐಚ್ಛಿಕ)',
      selectEndDate: 'ಅಂತಿಮ ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ',

      saveReminder: 'ಜ್ಞಾಪನೆಯನ್ನು ಉಳಿಸಿ',

      reminders: 'ಜ್ಞಾಪನೆಗಳು',
      noRemindersYet: 'ಇನ್ನೂ ಯಾವುದೇ ಜ್ಞಾಪನೆಗಳಿಲ್ಲ.',
      unknown: 'ಅಜ್ಞಾತ',

      daily: 'ದೈನಂದಿನ',
      oneTime: 'ಒಮ್ಮೆ',
      ends: 'ಮುಕ್ತಾಯ:',
      status: 'ಸ್ಥಿತಿ:',

      pending: 'ಬಾಕಿಯಿದೆ',
      taken: 'ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ',
      missed: 'ತಪ್ಪಿಹೋಗಿದೆ',

      medicineReminder: 'ಔಷಧ ಜ್ಞಾಪನೆ',
      medicineReminders: 'ಔಷಧ ಜ್ಞಾಪನೆಗಳು',
      take: 'ತೆಗೆದುಕೊಳ್ಳಿ',

      missingField: 'ಮಾಹಿತಿ ಅಗತ್ಯ',
      enterMedicine: 'ದಯವಿಟ್ಟು ಔಷಧದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.',

      invalidTime: 'ಅಮಾನ್ಯ ಸಮಯ',
      selectValidTime: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಜ್ಞಾಪನೆ ಸಮಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',

      invalidEndDate: 'ಅಮಾನ್ಯ ಅಂತಿಮ ದಿನಾಂಕ',
      endDateFuture: 'ಅಂತಿಮ ದಿನಾಂಕ ಇಂದಿನ ಅಥವಾ ಭವಿಷ್ಯದ ದಿನಾಂಕವಾಗಿರಬೇಕು.',

      reminderSaved: 'ಜ್ಞಾಪನೆ ಉಳಿಸಲಾಗಿದೆ',
      scheduled: 'ನಿಮ್ಮ ಔಷಧ ಜ್ಞಾಪನೆಯನ್ನು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.',
      savedNoNotifications:
        'ನಿಮ್ಮ ಜ್ಞಾಪನೆಯನ್ನು ಉಳಿಸಲಾಗಿದೆ, ಆದರೆ ಪ್ರಸ್ತುತ ಪರಿಸರದಲ್ಲಿ ಅಧಿಸೂಚನೆಗಳು ಲಭ್ಯವಿಲ್ಲ.',

      storageError: 'ಸಂಗ್ರಹಣೆ ದೋಷ',
      unableToSave: 'ನಿಮ್ಮ ಜ್ಞಾಪನೆಯನ್ನು ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',

      noReminders: 'ಜ್ಞಾಪನೆಗಳಿಲ್ಲ',
      noRemindersToShare: 'ಹಂಚಿಕೊಳ್ಳಲು ಯಾವುದೇ ಜ್ಞಾಪನೆಗಳಿಲ್ಲ.',

      myMedicineReminders: 'ನನ್ನ ಔಷಧ ಜ್ಞಾಪನೆಗಳು',

      shareFailed: 'ಹಂಚಿಕೆ ವಿಫಲವಾಗಿದೆ',
      unableToShare: 'ಜ್ಞಾಪನೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.'
    },

    maps: {
      title: 'ನಕ್ಷೆಗಳು',
      subtitle: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸ್ಥಳದ ಸಮೀಪದ ಔಷಧಾಲಯಗಳು',
      gettingLocation: 'ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
      loadingShops: 'ಸಮೀಪದ ವೈದ್ಯಕೀಯ ಅಂಗಡಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
      medicalShop: 'ವೈದ್ಯಕೀಯ ಅಂಗಡಿ',
      pharmacy: 'ಔಷಧಾಲಯ',
      pharmacyNearby: 'ಸಮೀಪದ ಔಷಧಾಲಯ',
      addressNotAvailable: 'ವಿಳಾಸ ಲಭ್ಯವಿಲ್ಲ',
      permissionRequired: 'ಅನುಮತಿ ಅಗತ್ಯವಿದೆ',
      locationPermission: 'ಸ್ಥಳ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ.',
      fetchError: 'ಸಮೀಪದ ವೈದ್ಯಕೀಯ ಅಂಗಡಿಗಳನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
      locationError: 'ಸ್ಥಳವನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
      openMapsError: 'ನಕ್ಷೆ ಅಪ್ಲಿಕೇಶನ್ ತೆರೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
      directionsTo: '{{name}} ಗೆ ದಿಕ್ಕುಗಳು'
    },

    medicine: {
      search: 'ಔಷಧ ಹುಡುಕಿ',
      searchPlaceholder: 'ಔಷಧದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
      suggestions: 'ಸಲಹೆಗಳು',
      history: 'ಹುಡುಕಾಟ ಇತಿಹಾಸ',
      clearHistory: 'ಇತಿಹಾಸವನ್ನು ತೆರವುಗೊಳಿಸಿ',
      details: 'ಔಷಧದ ವಿವರಗಳು',
      substitutes: 'ಸೂಚಿಸಲಾದ ಪರ್ಯಾಯ ಔಷಧಗಳು',
      price: 'ಬೆಲೆ',
      close: 'ಮುಚ್ಚಿ',
      noResults: 'ಯಾವುದೇ ಔಷಧ ಕಂಡುಬಂದಿಲ್ಲ.'
    },

    med: {
      medicalEnquiry: 'ವೈದ್ಯಕೀಯ ವಿಚಾರಣೆ',
      tabletName: 'ಮಾತ್ರೆಯ ಹೆಸರು',
      enterTabletName: 'ಮಾತ್ರೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
      search: 'ಹುಡುಕಿ',
      searchHistory: 'ಹುಡುಕಾಟ ಇತಿಹಾಸ',
      noHistory: 'ಇನ್ನೂ ಯಾವುದೇ ಇತಿಹಾಸವಿಲ್ಲ',
      suggested: 'ಸೂಚಿಸಲಾದವು',

      manufacturer: 'ತಯಾರಕರು',
      price: 'ಬೆಲೆ',
      type: 'ಪ್ರಕಾರ',
      packaging: 'ಪ್ಯಾಕೇಜಿಂಗ್',
      composition1: 'ಸಂಯೋಜನೆ 1',
      composition2: 'ಸಂಯೋಜನೆ 2',
      sideEffects: 'ಅಡ್ಡ ಪರಿಣಾಮಗಳು',
      use: 'ಬಳಕೆ',
      chemicalClass: 'ರಾಸಾಯನಿಕ ವರ್ಗ',
      habitForming: 'ಅಭ್ಯಾಸವನ್ನು ಉಂಟುಮಾಡುವ',
      therapeuticClass: 'ಚಿಕಿತ್ಸಾ ವರ್ಗ',
      actionClass: 'ಕ್ರಿಯಾ ವರ್ಗ',
      close: 'ಮುಚ್ಚಿ'
    },

    common: {
      cancel: 'ರದ್ದು',
      close: 'ಮುಚ್ಚಿ',
      done: 'ಮುಗಿದಿದೆ',
      save: 'ಉಳಿಸಿ',
      delete: 'ಅಳಿಸಿ',
      edit: 'ಸಂಪಾದಿಸಿ',
      error: 'ದೋಷ',
      success: 'ಯಶಸ್ಸು',
      loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      yes: 'ಹೌದು',
      no: 'ಇಲ್ಲ'
    }
  },

  // =======================================================
  // MARATHI
  // =======================================================

  mr: {
    app: {
      selectLanguage: 'भाषा निवडा',
      language: 'भाषा',
      done: 'पूर्ण',
      chooseLanguage: 'तुमची पसंतीची भाषा निवडा',
      changeAnytime: 'तुम्ही होम स्क्रीनवरून कधीही भाषा बदलू शकता.'
    },

    tabs: {
      home: 'होम',
      maps: 'नकाशे',
      reminder: 'स्मरणपत्र',
      profile: 'प्रोफाइल'
    },

    home: {
      title: 'होम स्क्रीन',
      subtitle: 'औषधे शोधा आणि जवळची फार्मसी शोधा',
      searchMedicine: 'औषध शोधा'
    },

    login: {
      missingFields: 'माहिती अपूर्ण',
      enterCredentials: 'कृपया ईमेल आणि पासवर्ड भरा',
      success: 'यशस्वी',
      welcome: 'स्वागत {{name}}',
      loginFailed: 'लॉगिन अयशस्वी',
      somethingWrong: 'काहीतरी चूक झाली',
      email: 'ईमेल',
      password: 'पासवर्ड',
      login: 'लॉगिन',
      registerPrompt: 'खाते नाही? नोंदणी करा',
      subtitle: 'औषधे शोधा आणि जवळची फार्मसी शोधा'
    },

    profile: {
      title: 'प्रोफाइल',
      subtitle: 'तुमची वैयक्तिक आरोग्य माहिती व्यवस्थापित करा',
      edit: 'प्रोफाइल संपादित करा',
      editProfile: 'प्रोफाइल संपादित करा',
      updateInformation: 'माहिती अपडेट करा',
      saveChanges: 'बदल जतन करा',
      logout: 'लॉगआउट',
      language: 'भाषा',
      localStorageInfo:
        'तुमची प्रोफाइल माहिती तुमच्या डिव्हाइसवर स्थानिकरित्या साठवली आहे.',
      stored:
        'तुमची प्रोफाइल माहिती तुमच्या डिव्हाइसवर स्थानिकरित्या साठवली आहे.',
      updated: 'प्रोफाइल अपडेट झाले',
      saved: 'तुमची प्रोफाइल यशस्वीरित्या जतन झाली.',
      error: 'त्रुटी',
      logoutFailed: 'लॉगआउट अयशस्वी',
      name: 'नाव',
      age: 'वय',
      year: 'वर्ष',
      height: 'उंची',
      weight: 'वजन',
      cm: 'सेमी',
      kg: 'किलो',
      bmi: 'BMI',
      bmr: 'BMR',
      calPerDay: 'कॅलरी/दिवस',
      gender: 'लिंग',
      genderOptions: {
        male: 'पुरुष',
        female: 'महिला',
        other: 'इतर',
        'prefer not to say': 'सांगणे पसंत नाही'
      }
    },

    reminder: {
      title: 'स्मरणपत्र',
      medicineName: 'औषधाचे नाव',
      selectTime: 'वेळ निवडा',
      breakfast: 'नाश्ता',
      lunch: 'दुपारचे जेवण',
      dinner: 'रात्रीचे जेवण',
      custom: 'कस्टम',

      beforeAfterFood: 'जेवणापूर्वी / नंतर',
      before: 'पूर्वी',
      after: 'नंतर',
      beforeFood: 'जेवणापूर्वी',
      afterFood: 'जेवणानंतर',

      reminderOffset: 'स्मरणपत्र अंतर',
      min: 'मिनिटे',

      endDateOptional: 'समाप्ती तारीख (ऐच्छिक)',
      selectEndDate: 'समाप्ती तारीख निवडा',

      saveReminder: 'स्मरणपत्र जतन करा',

      reminders: 'स्मरणपत्रे',
      noRemindersYet: 'अद्याप कोणतेही स्मरणपत्र नाही.',
      unknown: 'अज्ञात',

      daily: 'दररोज',
      oneTime: 'एकदा',
      ends: 'समाप्त:',
      status: 'स्थिती:',

      pending: 'प्रलंबित',
      taken: 'घेतले',
      missed: 'चुकले',

      medicineReminder: 'औषध स्मरणपत्र',
      medicineReminders: 'औषध स्मरणपत्रे',
      take: 'घ्या',

      missingField: 'माहिती अपूर्ण',
      enterMedicine: 'कृपया औषधाचे नाव प्रविष्ट करा.',

      invalidTime: 'अवैध वेळ',
      selectValidTime: 'कृपया वैध स्मरणपत्र वेळ निवडा.',

      invalidEndDate: 'अवैध समाप्ती तारीख',
      endDateFuture: 'समाप्ती तारीख आजची किंवा भविष्यातील असावी.',

      reminderSaved: 'स्मरणपत्र जतन झाले',
      scheduled: 'तुमचे औषध स्मरणपत्र नियोजित केले आहे.',
      savedNoNotifications:
        'तुमचे स्मरणपत्र जतन झाले आहे, परंतु सध्याच्या वातावरणात सूचना उपलब्ध नाहीत.',

      storageError: 'स्टोरेज त्रुटी',
      unableToSave: 'तुमचे स्मरणपत्र जतन करता आले नाही.',

      noReminders: 'स्मरणपत्रे नाहीत',
      noRemindersToShare: 'सामायिक करण्यासाठी कोणतेही स्मरणपत्र नाही.',

      myMedicineReminders: 'माझी औषध स्मरणपत्रे',

      shareFailed: 'सामायिकरण अयशस्वी',
      unableToShare: 'स्मरणपत्रे सामायिक करता आली नाहीत.'
    },

    maps: {
      title: 'नकाशे',
      subtitle: 'तुमच्या सध्याच्या स्थानाजवळील फार्मसी',
      gettingLocation: 'तुमचे स्थान मिळवत आहे...',
      loadingShops: 'जवळच्या मेडिकल दुकानांचे लोडिंग सुरू आहे...',
      medicalShop: 'मेडिकल दुकान',
      pharmacy: 'फार्मसी',
      pharmacyNearby: 'जवळची फार्मसी',
      addressNotAvailable: 'पत्ता उपलब्ध नाही',
      permissionRequired: 'परवानगी आवश्यक',
      locationPermission: 'स्थानाची परवानगी आवश्यक आहे.',
      fetchError: 'जवळची मेडिकल दुकाने मिळवता आली नाहीत.',
      locationError: 'स्थान मिळवता आले नाही.',
      openMapsError: 'मॅप्स अॅप उघडता आले नाही.',
      directionsTo: '{{name}} साठी दिशानिर्देश'
    },

    medicine: {
      search: 'औषध शोधा',
      searchPlaceholder: 'औषधाचे नाव प्रविष्ट करा',
      suggestions: 'सूचना',
      history: 'शोध इतिहास',
      clearHistory: 'इतिहास साफ करा',
      details: 'औषधाची माहिती',
      substitutes: 'सुचवलेली पर्यायी औषधे',
      price: 'किंमत',
      close: 'बंद करा',
      noResults: 'कोणतेही औषध सापडले नाही.'
    },

    med: {
      medicalEnquiry: 'वैद्यकीय चौकशी',
      tabletName: 'टॅब्लेटचे नाव',
      enterTabletName: 'टॅब्लेटचे नाव प्रविष्ट करा',
      search: 'शोधा',
      searchHistory: 'शोध इतिहास',
      noHistory: 'अद्याप कोणताही इतिहास नाही',
      suggested: 'सुचवलेले',

      manufacturer: 'उत्पादक',
      price: 'किंमत',
      type: 'प्रकार',
      packaging: 'पॅकेजिंग',
      composition1: 'संयोजन १',
      composition2: 'संयोजन २',
      sideEffects: 'दुष्परिणाम',
      use: 'वापर',
      chemicalClass: 'रासायनिक वर्ग',
      habitForming: 'सवय लागणारे',
      therapeuticClass: 'उपचारात्मक वर्ग',
      actionClass: 'क्रिया वर्ग',
      close: 'बंद करा'
    },

    common: {
      cancel: 'रद्द करा',
      close: 'बंद करा',
      done: 'पूर्ण',
      save: 'जतन करा',
      delete: 'हटवा',
      edit: 'संपादित करा',
      error: 'त्रुटी',
      success: 'यशस्वी',
      loading: 'लोड होत आहे...',
      retry: 'पुन्हा प्रयत्न करा',
      yes: 'होय',
      no: 'नाही'
    }
  },

  // =======================================================
  // GUJARATI
  // =======================================================

  gu: {
    app: {
      selectLanguage: 'ભાષા પસંદ કરો',
      language: 'ભાષા',
      done: 'થઈ ગયું',
      chooseLanguage: 'તમારી પસંદગીની ભાષા પસંદ કરો',
      changeAnytime: 'તમે હોમ સ્ક્રીન પરથી કોઈપણ સમયે ભાષા બદલી શકો છો.'
    },

    tabs: {
      home: 'હોમ',
      maps: 'નકશા',
      reminder: 'રિમાઇન્ડર',
      profile: 'પ્રોફાઇલ'
    },

    home: {
      title: 'હોમ સ્ક્રીન',
      subtitle: 'દવાઓ શોધો અને નજીકની ફાર્મસી શોધો',
      searchMedicine: 'દવા શોધો'
    },

    login: {
      missingFields: 'માહિતી અધૂરી છે',
      enterCredentials: 'કૃપા કરીને ઇમેઇલ અને પાસવર્ડ દાખલ કરો',
      success: 'સફળતા',
      welcome: 'સ્વાગત છે {{name}}',
      loginFailed: 'લૉગિન નિષ્ફળ',
      somethingWrong: 'કંઈક ખોટું થયું',
      email: 'ઇમેઇલ',
      password: 'પાસવર્ડ',
      login: 'લૉગિન',
      registerPrompt: 'એકાઉન્ટ નથી? રજીસ્ટર કરો',
      subtitle: 'દવાઓ શોધો અને નજીકની ફાર્મસી શોધો'
    },

    profile: {
      title: 'પ્રોફાઇલ',
      subtitle: 'તમારી વ્યક્તિગત આરોગ્ય માહિતીનું સંચાલન કરો',
      edit: 'પ્રોફાઇલ સંપાદિત કરો',
      editProfile: 'પ્રોફાઇલ સંપાદિત કરો',
      updateInformation: 'માહિતી અપડેટ કરો',
      saveChanges: 'ફેરફારો સાચવો',
      logout: 'લૉગઆઉટ',
      language: 'ભાષા',
      localStorageInfo:
        'તમારી પ્રોફાઇલ માહિતી તમારા ઉપકરણમાં સ્થાનિક રીતે સંગ્રહિત છે.',
      stored: 'તમારી પ્રોફાઇલ માહિતી તમારા ઉપકરણમાં સ્થાનિક રીતે સંગ્રહિત છે.',
      updated: 'પ્રોફાઇલ અપડેટ થઈ',
      saved: 'તમારી પ્રોફાઇલ સફળતાપૂર્વક સાચવાઈ છે.',
      error: 'ભૂલ',
      logoutFailed: 'લૉગઆઉટ નિષ્ફળ',
      name: 'નામ',
      age: 'ઉંમર',
      year: 'વર્ષ',
      height: 'ઊંચાઈ',
      weight: 'વજન',
      cm: 'સેમી',
      kg: 'કિગ્રા',
      bmi: 'BMI',
      bmr: 'BMR',
      calPerDay: 'કેલરી/દિવસ',
      gender: 'લિંગ',
      genderOptions: {
        male: 'પુરુષ',
        female: 'સ્ત્રી',
        other: 'અન્ય',
        'prefer not to say': 'કહેવા માંગતા નથી'
      }
    },

    reminder: {
      title: 'રિમાઇન્ડર',
      medicineName: 'દવાનું નામ',
      selectTime: 'સમય પસંદ કરો',
      breakfast: 'નાસ્તો',
      lunch: 'બપોરનું ભોજન',
      dinner: 'રાત્રિભોજન',
      custom: 'કસ્ટમ',

      beforeAfterFood: 'ભોજન પહેલાં / પછી',
      before: 'પહેલાં',
      after: 'પછી',
      beforeFood: 'ભોજન પહેલાં',
      afterFood: 'ભોજન પછી',

      reminderOffset: 'રિમાઇન્ડર અંતર',
      min: 'મિનિટ',

      endDateOptional: 'અંતિમ તારીખ (વૈકલ્પિક)',
      selectEndDate: 'અંતિમ તારીખ પસંદ કરો',

      saveReminder: 'રિમાઇન્ડર સાચવો',

      reminders: 'રિમાઇન્ડર્સ',
      noRemindersYet: 'હજી સુધી કોઈ રિમાઇન્ડર નથી.',
      unknown: 'અજ્ઞાત',

      daily: 'દૈનિક',
      oneTime: 'એક વખત',
      ends: 'સમાપ્ત:',
      status: 'સ્થિતિ:',

      pending: 'બાકી',
      taken: 'લીધી',
      missed: 'ચૂકી ગઈ',

      medicineReminder: 'દવા રિમાઇન્ડર',
      medicineReminders: 'દવા રિમાઇન્ડર્સ',
      take: 'લો',

      missingField: 'માહિતી અધૂરી છે',
      enterMedicine: 'કૃપા કરીને દવાનું નામ દાખલ કરો.',

      invalidTime: 'અમાન્ય સમય',
      selectValidTime: 'કૃપા કરીને માન્ય રિમાઇન્ડર સમય પસંદ કરો.',

      invalidEndDate: 'અમાન્ય અંતિમ તારીખ',
      endDateFuture: 'અંતિમ તારીખ આજની અથવા ભવિષ્યની હોવી જોઈએ.',

      reminderSaved: 'રિમાઇન્ડર સાચવાયું',
      scheduled: 'તમારું દવા રિમાઇન્ડર શેડ્યૂલ કરવામાં આવ્યું છે.',
      savedNoNotifications:
        'તમારું રિમાઇન્ડર સાચવવામાં આવ્યું છે, પરંતુ વર્તમાન વાતાવરણમાં સૂચનાઓ ઉપલબ્ધ નથી.',

      storageError: 'સ્ટોરેજ ભૂલ',
      unableToSave: 'તમારું રિમાઇન્ડર સાચવી શકાયું નથી.',

      noReminders: 'કોઈ રિમાઇન્ડર નથી',
      noRemindersToShare: 'શેર કરવા માટે કોઈ રિમાઇન્ડર નથી.',

      myMedicineReminders: 'મારા દવા રિમાઇન્ડર્સ',

      shareFailed: 'શેર નિષ્ફળ',
      unableToShare: 'રિમાઇન્ડર્સ શેર કરી શકાયા નથી.'
    },

    maps: {
      title: 'નકશા',
      subtitle: 'તમારા વર્તમાન સ્થાનની નજીકની ફાર્મસી',
      gettingLocation: 'તમારું સ્થાન મેળવી રહ્યા છીએ...',
      loadingShops: 'નજીકની મેડિકલ દુકાનો લોડ થઈ રહી છે...',
      medicalShop: 'મેડિકલ દુકાન',
      pharmacy: 'ફાર્મસી',
      pharmacyNearby: 'નજીકની ફાર્મસી',
      addressNotAvailable: 'સરનામું ઉપલબ્ધ નથી',
      permissionRequired: 'પરવાનગી જરૂરી છે',
      locationPermission: 'સ્થાનની પરવાનગી જરૂરી છે.',
      fetchError: 'નજીકની મેડિકલ દુકાનો મેળવી શકાઈ નથી.',
      locationError: 'સ્થાન મેળવી શકાયું નથી.',
      openMapsError: 'મેપ્સ એપ ખોલી શકાઈ નથી.',
      directionsTo: '{{name}} માટે દિશાઓ'
    },

    medicine: {
      search: 'દવા શોધો',
      searchPlaceholder: 'દવાનું નામ દાખલ કરો',
      suggestions: 'સૂચનો',
      history: 'શોધ ઇતિહાસ',
      clearHistory: 'ઇતિહાસ સાફ કરો',
      details: 'દવાની વિગતો',
      substitutes: 'સૂચવેલી વૈકલ્પિક દવાઓ',
      price: 'કિંમત',
      close: 'બંધ કરો',
      noResults: 'કોઈ દવા મળી નથી.'
    },

    med: {
      medicalEnquiry: 'તબીબી પૂછપરછ',
      tabletName: 'ટેબ્લેટનું નામ',
      enterTabletName: 'ટેબ્લેટનું નામ દાખલ કરો',
      search: 'શોધો',
      searchHistory: 'શોધ ઇતિહાસ',
      noHistory: 'હજી સુધી કોઈ ઇતિહાસ નથી',
      suggested: 'સૂચવેલ',

      manufacturer: 'ઉત્પાદક',
      price: 'કિંમત',
      type: 'પ્રકાર',
      packaging: 'પેકેજિંગ',
      composition1: 'રચના 1',
      composition2: 'રચના 2',
      sideEffects: 'આડઅસરો',
      use: 'ઉપયોગ',
      chemicalClass: 'રાસાયણિક વર્ગ',
      habitForming: 'આદત પાડનાર',
      therapeuticClass: 'ઉપચારાત્મક વર્ગ',
      actionClass: 'ક્રિયા વર્ગ',
      close: 'બંધ કરો'
    },

    common: {
      cancel: 'રદ કરો',
      close: 'બંધ કરો',
      done: 'થઈ ગયું',
      save: 'સાચવો',
      delete: 'કાઢી નાખો',
      edit: 'સંપાદિત કરો',
      error: 'ભૂલ',
      success: 'સફળતા',
      loading: 'લોડ થઈ રહ્યું છે...',
      retry: 'ફરી પ્રયાસ કરો',
      yes: 'હા',
      no: 'ના'
    }
  },

  // =======================================================
  // MALAYALAM
  // =======================================================

  ml: {
    app: {
      selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
      language: 'ഭാഷ',
      done: 'പൂർത്തിയായി',
      chooseLanguage: 'നിങ്ങളുടെ ഇഷ്ടപ്പെട്ട ഭാഷ തിരഞ്ഞെടുക്കുക',
      changeAnytime: 'ഹോം സ്ക്രീനിൽ നിന്ന് എപ്പോൾ വേണമെങ്കിലും ഭാഷ മാറ്റാം.'
    },

    tabs: {
      home: 'ഹോം',
      maps: 'മാപ്പ്',
      reminder: 'ഓർമ്മപ്പെടുത്തൽ',
      profile: 'പ്രൊഫൈൽ'
    },

    home: {
      title: 'ഹോം സ്ക്രീൻ',
      subtitle: 'മരുന്നുകൾ തിരഞ്ഞ് സമീപത്തെ ഫാർമസികൾ കണ്ടെത്തുക',
      searchMedicine: 'മരുന്ന് തിരയുക'
    },

    login: {
      missingFields: 'വിവരങ്ങൾ അപൂർണ്ണമാണ്',
      enterCredentials: 'ഇമെയിലും പാസ്‌വേഡും നൽകുക',
      success: 'വിജയം',
      welcome: 'സ്വാഗതം {{name}}',
      loginFailed: 'ലോഗിൻ പരാജയപ്പെട്ടു',
      somethingWrong: 'എന്തോ തെറ്റ് സംഭവിച്ചു',
      email: 'ഇമെയിൽ',
      password: 'പാസ്‌വേഡ്',
      login: 'ലോഗിൻ',
      registerPrompt: 'അക്കൗണ്ട് ഇല്ലേ? രജിസ്റ്റർ ചെയ്യുക',
      subtitle: 'മരുന്നുകൾ തിരഞ്ഞ് സമീപത്തെ ഫാർമസികൾ കണ്ടെത്തുക'
    },

    profile: {
      title: 'പ്രൊഫൈൽ',
      subtitle: 'നിങ്ങളുടെ വ്യക്തിഗത ആരോഗ്യ വിവരങ്ങൾ നിയന്ത്രിക്കുക',
      edit: 'പ്രൊഫൈൽ തിരുത്തുക',
      editProfile: 'പ്രൊഫൈൽ തിരുത്തുക',
      updateInformation: 'വിവരങ്ങൾ പുതുക്കുക',
      saveChanges: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക',
      logout: 'ലോഗൗട്ട്',
      language: 'ഭാഷ',
      localStorageInfo:
        'നിങ്ങളുടെ പ്രൊഫൈൽ വിവരങ്ങൾ ഉപകരണത്തിൽ പ്രാദേശികമായി സംഭരിച്ചിരിക്കുന്നു.',
      stored:
        'നിങ്ങളുടെ പ്രൊഫൈൽ വിവരങ്ങൾ ഉപകരണത്തിൽ പ്രാദേശികമായി സംഭരിച്ചിരിക്കുന്നു.',
      updated: 'പ്രൊഫൈൽ പുതുക്കി',
      saved: 'നിങ്ങളുടെ പ്രൊഫൈൽ വിജയകരമായി സംരക്ഷിച്ചു.',
      error: 'പിശക്',
      logoutFailed: 'ലോഗൗട്ട് പരാജയപ്പെട്ടു',
      name: 'പേര്',
      age: 'പ്രായം',
      year: 'വർഷം',
      height: 'ഉയരം',
      weight: 'ഭാരം',
      cm: 'സെ.മീ',
      kg: 'കി.ഗ്രാം',
      bmi: 'BMI',
      bmr: 'BMR',
      calPerDay: 'കലോറി/ദിവസം',
      gender: 'ലിംഗം',
      genderOptions: {
        male: 'പുരുഷൻ',
        female: 'സ്ത്രീ',
        other: 'മറ്റുള്ളവ',
        'prefer not to say': 'പറയാൻ താൽപ്പര്യമില്ല'
      }
    },

    reminder: {
      title: 'ഓർമ്മപ്പെടുത്തൽ',
      medicineName: 'മരുന്നിന്റെ പേര്',
      selectTime: 'സമയം തിരഞ്ഞെടുക്കുക',
      breakfast: 'പ്രഭാതഭക്ഷണം',
      lunch: 'ഉച്ചഭക്ഷണം',
      dinner: 'അത്താഴം',
      custom: 'കസ്റ്റം',

      beforeAfterFood: 'ഭക്ഷണത്തിന് മുമ്പ് / ശേഷം',
      before: 'മുമ്പ്',
      after: 'ശേഷം',
      beforeFood: 'ഭക്ഷണത്തിന് മുമ്പ്',
      afterFood: 'ഭക്ഷണത്തിന് ശേഷം',

      reminderOffset: 'ഓർമ്മപ്പെടുത്തൽ ഇടവേള',
      min: 'മിനിറ്റ്',

      endDateOptional: 'അവസാന തീയതി (ഓപ്ഷണൽ)',
      selectEndDate: 'അവസാന തീയതി തിരഞ്ഞെടുക്കുക',

      saveReminder: 'ഓർമ്മപ്പെടുത്തൽ സംരക്ഷിക്കുക',

      reminders: 'ഓർമ്മപ്പെടുത്തലുകൾ',
      noRemindersYet: 'ഇതുവരെ ഓർമ്മപ്പെടുത്തലുകളൊന്നുമില്ല.',
      unknown: 'അജ്ഞാതം',

      daily: 'ദിവസേന',
      oneTime: 'ഒരിക്കൽ',
      ends: 'അവസാനം:',
      status: 'നില:',

      pending: 'തീർപ്പാക്കാത്തത്',
      taken: 'കഴിച്ചു',
      missed: 'നഷ്ടപ്പെട്ടു',

      medicineReminder: 'മരുന്ന് ഓർമ്മപ്പെടുത്തൽ',
      medicineReminders: 'മരുന്ന് ഓർമ്മപ്പെടുത്തലുകൾ',
      take: 'കഴിക്കുക',

      missingField: 'വിവരം അപൂർണ്ണമാണ്',
      enterMedicine: 'ദയവായി മരുന്നിന്റെ പേര് നൽകുക.',

      invalidTime: 'അസാധുവായ സമയം',
      selectValidTime: 'ദയവായി സാധുവായ ഓർമ്മപ്പെടുത്തൽ സമയം തിരഞ്ഞെടുക്കുക.',

      invalidEndDate: 'അസാധുവായ അവസാന തീയതി',
      endDateFuture: 'അവസാന തീയതി ഇന്നത്തേതോ ഭാവിയിലേതോ ആയിരിക്കണം.',

      reminderSaved: 'ഓർമ്മപ്പെടുത്തൽ സംരക്ഷിച്ചു',
      scheduled: 'നിങ്ങളുടെ മരുന്ന് ഓർമ്മപ്പെടുത്തൽ ഷെഡ്യൂൾ ചെയ്തു.',
      savedNoNotifications:
        'നിങ്ങളുടെ ഓർമ്മപ്പെടുത്തൽ സംരക്ഷിച്ചു, എന്നാൽ നിലവിലെ പരിതസ്ഥിതിയിൽ അറിയിപ്പുകൾ ലഭ്യമല്ല.',

      storageError: 'സ്റ്റോറേജ് പിശക്',
      unableToSave: 'നിങ്ങളുടെ ഓർമ്മപ്പെടുത്തൽ സംരക്ഷിക്കാൻ കഴിഞ്ഞില്ല.',

      noReminders: 'ഓർമ്മപ്പെടുത്തലുകളില്ല',
      noRemindersToShare: 'പങ്കിടാൻ ഓർമ്മപ്പെടുത്തലുകളൊന്നുമില്ല.',

      myMedicineReminders: 'എന്റെ മരുന്ന് ഓർമ്മപ്പെടുത്തലുകൾ',

      shareFailed: 'പങ്കിടൽ പരാജയപ്പെട്ടു',
      unableToShare: 'ഓർമ്മപ്പെടുത്തലുകൾ പങ്കിടാൻ കഴിഞ്ഞില്ല.'
    },

    maps: {
      title: 'മാപ്പ്',
      subtitle: 'നിങ്ങളുടെ നിലവിലെ സ്ഥാനത്തിന് സമീപമുള്ള ഫാർമസികൾ',
      gettingLocation: 'നിങ്ങളുടെ സ്ഥാനം നേടുന്നു...',
      loadingShops: 'സമീപത്തെ മെഡിക്കൽ ഷോപ്പുകൾ ലോഡ് ചെയ്യുന്നു...',
      medicalShop: 'മെഡിക്കൽ ഷോപ്പ്',
      pharmacy: 'ഫാർമസി',
      pharmacyNearby: 'സമീപത്തെ ഫാർമസി',
      addressNotAvailable: 'വിലാസം ലഭ്യമല്ല',
      permissionRequired: 'അനുമതി ആവശ്യമാണ്',
      locationPermission: 'ലൊക്കേഷൻ അനുമതി ആവശ്യമാണ്.',
      fetchError: 'സമീപത്തെ മെഡിക്കൽ ഷോപ്പുകൾ ലഭ്യമാക്കാൻ കഴിഞ്ഞില്ല.',
      locationError: 'സ്ഥാനം ലഭ്യമാക്കാൻ കഴിഞ്ഞില്ല.',
      openMapsError: 'മാപ്പ് ആപ്പ് തുറക്കാൻ കഴിഞ്ഞില്ല.',
      directionsTo: '{{name}}-ലേക്കുള്ള ദിശകൾ'
    },

    medicine: {
      search: 'മരുന്ന് തിരയുക',
      searchPlaceholder: 'മരുന്നിന്റെ പേര് നൽകുക',
      suggestions: 'നിർദ്ദേശങ്ങൾ',
      history: 'തിരയൽ ചരിത്രം',
      clearHistory: 'ചരിത്രം മായ്ക്കുക',
      details: 'മരുന്നിന്റെ വിശദാംശങ്ങൾ',
      substitutes: 'നിർദ്ദേശിച്ച പകരം മരുന്നുകൾ',
      price: 'വില',
      close: 'അടയ്ക്കുക',
      noResults: 'മരുന്നൊന്നും കണ്ടെത്തിയില്ല.'
    },

    med: {
      medicalEnquiry: 'മെഡിക്കൽ അന്വേഷണം',
      tabletName: 'ടാബ്ലെറ്റിന്റെ പേര്',
      enterTabletName: 'ടാബ്ലെറ്റിന്റെ പേര് നൽകുക',
      search: 'തിരയുക',
      searchHistory: 'തിരയൽ ചരിത്രം',
      noHistory: 'ഇതുവരെ ചരിത്രമില്ല',
      suggested: 'നിർദ്ദേശിച്ചവ',

      manufacturer: 'നിർമ്മാതാവ്',
      price: 'വില',
      type: 'തരം',
      packaging: 'പാക്കേജിംഗ്',
      composition1: 'ഘടന 1',
      composition2: 'ഘടന 2',
      sideEffects: 'പാർശ്വഫലങ്ങൾ',
      use: 'ഉപയോഗം',
      chemicalClass: 'രാസ വിഭാഗം',
      habitForming: 'ശീലമാകാൻ സാധ്യതയുള്ളത്',
      therapeuticClass: 'ചികിത്സാ വിഭാഗം',
      actionClass: 'പ്രവർത്തന വിഭാഗം',
      close: 'അടയ്ക്കുക'
    },

    common: {
      cancel: 'റദ്ദാക്കുക',
      close: 'അടയ്ക്കുക',
      done: 'പൂർത്തിയായി',
      save: 'സംരക്ഷിക്കുക',
      delete: 'ഇല്ലാതാക്കുക',
      edit: 'തിരുത്തുക',
      error: 'പിശക്',
      success: 'വിജയം',
      loading: 'ലോഡ് ചെയ്യുന്നു...',
      retry: 'വീണ്ടും ശ്രമിക്കുക',
      yes: 'അതെ',
      no: 'ഇല്ല'
    }
  },

  // =======================================================
  // PUNJABI
  // =======================================================

  pa: {
    app: {
      selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
      language: 'ਭਾਸ਼ਾ',
      done: 'ਹੋ ਗਿਆ',
      chooseLanguage: 'ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ',
      changeAnytime: 'ਤੁਸੀਂ ਹੋਮ ਸਕ੍ਰੀਨ ਤੋਂ ਕਿਸੇ ਵੀ ਸਮੇਂ ਭਾਸ਼ਾ ਬਦਲ ਸਕਦੇ ਹੋ।'
    },

    tabs: {
      home: 'ਹੋਮ',
      maps: 'ਨਕਸ਼ੇ',
      reminder: 'ਰੀਮਾਈਂਡਰ',
      profile: 'ਪ੍ਰੋਫਾਈਲ'
    },

    home: {
      title: 'ਹੋਮ ਸਕ੍ਰੀਨ',
      subtitle: 'ਦਵਾਈਆਂ ਖੋਜੋ ਅਤੇ ਨੇੜਲੀਆਂ ਫਾਰਮੇਸੀਆਂ ਲੱਭੋ',
      searchMedicine: 'ਦਵਾਈ ਖੋਜੋ'
    },

    login: {
      missingFields: 'ਜਾਣਕਾਰੀ ਅਧੂਰੀ ਹੈ',
      enterCredentials: 'ਕਿਰਪਾ ਕਰਕੇ ਈਮੇਲ ਅਤੇ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ',
      success: 'ਸਫਲਤਾ',
      welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ {{name}}',
      loginFailed: 'ਲਾਗਇਨ ਅਸਫਲ',
      somethingWrong: 'ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ',
      email: 'ਈਮੇਲ',
      password: 'ਪਾਸਵਰਡ',
      login: 'ਲਾਗਇਨ',
      registerPrompt: 'ਖਾਤਾ ਨਹੀਂ ਹੈ? ਰਜਿਸਟਰ ਕਰੋ',
      subtitle: 'ਦਵਾਈਆਂ ਖੋਜੋ ਅਤੇ ਨੇੜਲੀਆਂ ਫਾਰਮੇਸੀਆਂ ਲੱਭੋ'
    },

    profile: {
      title: 'ਪ੍ਰੋਫਾਈਲ',
      subtitle: 'ਆਪਣੀ ਨਿੱਜੀ ਸਿਹਤ ਜਾਣਕਾਰੀ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ',
      edit: 'ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ',
      editProfile: 'ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ',
      updateInformation: 'ਜਾਣਕਾਰੀ ਅੱਪਡੇਟ ਕਰੋ',
      saveChanges: 'ਤਬਦੀਲੀਆਂ ਸੇਵ ਕਰੋ',
      logout: 'ਲਾਗਆਉਟ',
      language: 'ਭਾਸ਼ਾ',
      localStorageInfo:
        "ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਜਾਣਕਾਰੀ ਤੁਹਾਡੇ ਡਿਵਾਈਸ 'ਤੇ ਸਥਾਨਕ ਤੌਰ 'ਤੇ ਸਟੋਰ ਹੈ।",
      stored:
        "ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਜਾਣਕਾਰੀ ਤੁਹਾਡੇ ਡਿਵਾਈਸ 'ਤੇ ਸਥਾਨਕ ਤੌਰ 'ਤੇ ਸਟੋਰ ਹੈ।",
      updated: 'ਪ੍ਰੋਫਾਈਲ ਅੱਪਡੇਟ ਹੋਈ',
      saved: 'ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਹੋ ਗਈ ਹੈ।',
      error: 'ਗਲਤੀ',
      logoutFailed: 'ਲਾਗਆਉਟ ਅਸਫਲ',
      name: 'ਨਾਮ',
      age: 'ਉਮਰ',
      year: 'ਸਾਲ',
      height: 'ਕੱਦ',
      weight: 'ਭਾਰ',
      cm: 'ਸੈ.ਮੀ.',
      kg: 'ਕਿਲੋ',
      bmi: 'BMI',
      bmr: 'BMR',
      calPerDay: 'ਕੈਲੋਰੀ/ਦਿਨ',
      gender: 'ਲਿੰਗ',
      genderOptions: {
        male: 'ਪੁਰਸ਼',
        female: 'ਔਰਤ',
        other: 'ਹੋਰ',
        'prefer not to say': 'ਦੱਸਣਾ ਪਸੰਦ ਨਹੀਂ'
      }
    },

    reminder: {
      title: 'ਰੀਮਾਈਂਡਰ',
      medicineName: 'ਦਵਾਈ ਦਾ ਨਾਮ',
      selectTime: 'ਸਮਾਂ ਚੁਣੋ',
      breakfast: 'ਨਾਸ਼ਤਾ',
      lunch: 'ਦੁਪਹਿਰ ਦਾ ਖਾਣਾ',
      dinner: 'ਰਾਤ ਦਾ ਖਾਣਾ',
      custom: 'ਕਸਟਮ',

      beforeAfterFood: 'ਖਾਣੇ ਤੋਂ ਪਹਿਲਾਂ / ਬਾਅਦ',
      before: 'ਪਹਿਲਾਂ',
      after: 'ਬਾਅਦ',
      beforeFood: 'ਖਾਣੇ ਤੋਂ ਪਹਿਲਾਂ',
      afterFood: 'ਖਾਣੇ ਤੋਂ ਬਾਅਦ',

      reminderOffset: 'ਰੀਮਾਈਂਡਰ ਅੰਤਰ',
      min: 'ਮਿੰਟ',

      endDateOptional: 'ਅੰਤਿਮ ਮਿਤੀ (ਵਿਕਲਪਿਕ)',
      selectEndDate: 'ਅੰਤਿਮ ਮਿਤੀ ਚੁਣੋ',

      saveReminder: 'ਰੀਮਾਈਂਡਰ ਸੇਵ ਕਰੋ',

      reminders: 'ਰੀਮਾਈਂਡਰ',
      noRemindersYet: 'ਹਾਲੇ ਕੋਈ ਰੀਮਾਈਂਡਰ ਨਹੀਂ ਹੈ।',
      unknown: 'ਅਣਜਾਣ',

      daily: 'ਰੋਜ਼ਾਨਾ',
      oneTime: 'ਇੱਕ ਵਾਰ',
      ends: 'ਸਮਾਪਤ:',
      status: 'ਸਥਿਤੀ:',

      pending: 'ਬਕਾਇਆ',
      taken: 'ਲੈ ਲਿਆ',
      missed: 'ਛੁੱਟ ਗਿਆ',

      medicineReminder: 'ਦਵਾਈ ਰੀਮਾਈਂਡਰ',
      medicineReminders: 'ਦਵਾਈ ਰੀਮਾਈਂਡਰ',
      take: 'ਲਓ',

      missingField: 'ਜਾਣਕਾਰੀ ਅਧੂਰੀ ਹੈ',
      enterMedicine: 'ਕਿਰਪਾ ਕਰਕੇ ਦਵਾਈ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ।',

      invalidTime: 'ਅਵੈਧ ਸਮਾਂ',
      selectValidTime: 'ਕਿਰਪਾ ਕਰਕੇ ਵੈਧ ਰੀਮਾਈਂਡਰ ਸਮਾਂ ਚੁਣੋ।',

      invalidEndDate: 'ਅਵੈਧ ਅੰਤਿਮ ਮਿਤੀ',
      endDateFuture: 'ਅੰਤਿਮ ਮਿਤੀ ਅੱਜ ਜਾਂ ਭਵਿੱਖ ਦੀ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।',

      reminderSaved: 'ਰੀਮਾਈਂਡਰ ਸੇਵ ਹੋ ਗਿਆ',
      scheduled: 'ਤੁਹਾਡਾ ਦਵਾਈ ਰੀਮਾਈਂਡਰ ਨਿਰਧਾਰਤ ਕੀਤਾ ਗਿਆ ਹੈ।',
      savedNoNotifications:
        'ਤੁਹਾਡਾ ਰੀਮਾਈਂਡਰ ਸੇਵ ਹੋ ਗਿਆ ਹੈ, ਪਰ ਮੌਜੂਦਾ ਵਾਤਾਵਰਣ ਵਿੱਚ ਨੋਟੀਫਿਕੇਸ਼ਨ ਉਪਲਬਧ ਨਹੀਂ ਹਨ।',

      storageError: 'ਸਟੋਰੇਜ ਗਲਤੀ',
      unableToSave: 'ਤੁਹਾਡਾ ਰੀਮਾਈਂਡਰ ਸੇਵ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਿਆ।',

      noReminders: 'ਕੋਈ ਰੀਮਾਈਂਡਰ ਨਹੀਂ',
      noRemindersToShare: 'ਸਾਂਝਾ ਕਰਨ ਲਈ ਕੋਈ ਰੀਮਾਈਂਡਰ ਨਹੀਂ ਹੈ।',

      myMedicineReminders: 'ਮੇਰੇ ਦਵਾਈ ਰੀਮਾਈਂਡਰ',

      shareFailed: 'ਸਾਂਝਾ ਕਰਨਾ ਅਸਫਲ',
      unableToShare: 'ਰੀਮਾਈਂਡਰ ਸਾਂਝੇ ਨਹੀਂ ਕੀਤੇ ਜਾ ਸਕੇ।'
    },

    maps: {
      title: 'ਨਕਸ਼ੇ',
      subtitle: 'ਤੁਹਾਡੇ ਮੌਜੂਦਾ ਟਿਕਾਣੇ ਦੇ ਨੇੜੇ ਫਾਰਮੇਸੀਆਂ',
      gettingLocation: 'ਤੁਹਾਡਾ ਟਿਕਾਣਾ ਪ੍ਰਾਪਤ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
      loadingShops: 'ਨੇੜਲੀਆਂ ਮੈਡੀਕਲ ਦੁਕਾਨਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...',
      medicalShop: 'ਮੈਡੀਕਲ ਦੁਕਾਨ',
      pharmacy: 'ਫਾਰਮੇਸੀ',
      pharmacyNearby: 'ਨੇੜਲੀ ਫਾਰਮੇਸੀ',
      addressNotAvailable: 'ਪਤਾ ਉਪਲਬਧ ਨਹੀਂ',
      permissionRequired: 'ਇਜਾਜ਼ਤ ਲੋੜੀਂਦੀ ਹੈ',
      locationPermission: 'ਟਿਕਾਣੇ ਦੀ ਇਜਾਜ਼ਤ ਲੋੜੀਂਦੀ ਹੈ।',
      fetchError: 'ਨੇੜਲੀਆਂ ਮੈਡੀਕਲ ਦੁਕਾਨਾਂ ਪ੍ਰਾਪਤ ਨਹੀਂ ਕੀਤੀਆਂ ਜਾ ਸਕੀਆਂ।',
      locationError: 'ਟਿਕਾਣਾ ਪ੍ਰਾਪਤ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਿਆ।',
      openMapsError: 'ਮੈਪਸ ਐਪ ਨਹੀਂ ਖੋਲ੍ਹੀ ਜਾ ਸਕੀ।',
      directionsTo: '{{name}} ਲਈ ਦਿਸ਼ਾਵਾਂ'
    },

    medicine: {
      search: 'ਦਵਾਈ ਖੋਜੋ',
      searchPlaceholder: 'ਦਵਾਈ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ',
      suggestions: 'ਸੁਝਾਅ',
      history: 'ਖੋਜ ਇਤਿਹਾਸ',
      clearHistory: 'ਇਤਿਹਾਸ ਸਾਫ਼ ਕਰੋ',
      details: 'ਦਵਾਈ ਦੇ ਵੇਰਵੇ',
      substitutes: 'ਸੁਝਾਈਆਂ ਗਈਆਂ ਵਿਕਲਪਕ ਦਵਾਈਆਂ',
      price: 'ਕੀਮਤ',
      close: 'ਬੰਦ ਕਰੋ',
      noResults: 'ਕੋਈ ਦਵਾਈ ਨਹੀਂ ਮਿਲੀ।'
    },

    med: {
      medicalEnquiry: 'ਮੈਡੀਕਲ ਪੁੱਛਗਿੱਛ',
      tabletName: 'ਟੈਬਲੇਟ ਦਾ ਨਾਮ',
      enterTabletName: 'ਟੈਬਲੇਟ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ',
      search: 'ਖੋਜੋ',
      searchHistory: 'ਖੋਜ ਇਤਿਹਾਸ',
      noHistory: 'ਹਾਲੇ ਕੋਈ ਇਤਿਹਾਸ ਨਹੀਂ',
      suggested: 'ਸੁਝਾਏ ਗਏ',

      manufacturer: 'ਨਿਰਮਾਤਾ',
      price: 'ਕੀਮਤ',
      type: 'ਕਿਸਮ',
      packaging: 'ਪੈਕੇਜਿੰਗ',
      composition1: 'ਰਚਨਾ 1',
      composition2: 'ਰਚਨਾ 2',
      sideEffects: 'ਮਾੜੇ ਪ੍ਰਭਾਵ',
      use: 'ਵਰਤੋਂ',
      chemicalClass: 'ਰਸਾਇਣਕ ਸ਼੍ਰੇਣੀ',
      habitForming: 'ਆਦਤ ਪੈਦਾ ਕਰਨ ਵਾਲਾ',
      therapeuticClass: 'ਇਲਾਜ ਸ਼੍ਰੇਣੀ',
      actionClass: 'ਕਾਰਵਾਈ ਸ਼੍ਰੇਣੀ',
      close: 'ਬੰਦ ਕਰੋ'
    },

    common: {
      cancel: 'ਰੱਦ ਕਰੋ',
      close: 'ਬੰਦ ਕਰੋ',
      done: 'ਹੋ ਗਿਆ',
      save: 'ਸੁਰੱਖਿਅਤ ਕਰੋ',
      delete: 'ਮਿਟਾਓ',
      edit: 'ਸੋਧੋ',
      error: 'ਗਲਤੀ',
      success: 'ਸਫਲਤਾ',
      loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      retry: 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
      yes: 'ਹਾਂ',
      no: 'ਨਹੀਂ'
    }
  },

  // =======================================================
  // ODIA
  // =======================================================

  or: {
    app: {
      selectLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
      language: 'ଭାଷା',
      done: 'ସମାପ୍ତ',
      chooseLanguage: 'ଆପଣଙ୍କ ପସନ୍ଦର ଭାଷା ବାଛନ୍ତୁ',
      changeAnytime: 'ଆପଣ ହୋମ ସ୍କ୍ରିନରୁ ଯେକୌଣସି ସମୟରେ ଭାଷା ବଦଳାଇପାରିବେ।'
    },

    tabs: {
      home: 'ହୋମ',
      maps: 'ମାନଚିତ୍ର',
      reminder: 'ସ୍ମରଣିକା',
      profile: 'ପ୍ରୋଫାଇଲ'
    },

    home: {
      title: 'ହୋମ ସ୍କ୍ରିନ',
      subtitle: 'ଔଷଧ ଖୋଜନ୍ତୁ ଏବଂ ନିକଟସ୍ଥ ଫାର୍ମାସି ଖୋଜନ୍ତୁ',
      searchMedicine: 'ଔଷଧ ଖୋଜନ୍ତୁ'
    },

    login: {
      missingFields: 'ତଥ୍ୟ ଅପୂର୍ଣ୍ଣ',
      enterCredentials: 'ଦୟାକରି ଇମେଲ ଏବଂ ପାସୱାର୍ଡ ଦିଅନ୍ତୁ',
      success: 'ସଫଳତା',
      welcome: 'ସ୍ୱାଗତ {{name}}',
      loginFailed: 'ଲଗଇନ ବିଫଳ',
      somethingWrong: 'କିଛି ଭୁଲ ହୋଇଛି',
      email: 'ଇମେଲ',
      password: 'ପାସୱାର୍ଡ',
      login: 'ଲଗଇନ',
      registerPrompt: 'ଆକାଉଣ୍ଟ ନାହିଁ? ପଞ୍ଜିକରଣ କରନ୍ତୁ',
      subtitle: 'ଔଷଧ ଖୋଜନ୍ତୁ ଏବଂ ନିକଟସ୍ଥ ଫାର୍ମାସି ଖୋଜନ୍ତୁ'
    },

    profile: {
      title: 'ପ୍ରୋଫାଇଲ',
      subtitle: 'ଆପଣଙ୍କ ବ୍ୟକ୍ତିଗତ ସ୍ୱାସ୍ଥ୍ୟ ସୂଚନା ପରିଚାଳନା କରନ୍ତୁ',
      edit: 'ପ୍ରୋଫାଇଲ ସମ୍ପାଦନ କରନ୍ତୁ',
      editProfile: 'ପ୍ରୋଫାଇଲ ସମ୍ପାଦନ କରନ୍ତୁ',
      updateInformation: 'ସୂଚନା ଅପଡେଟ୍ କରନ୍ତୁ',
      saveChanges: 'ପରିବର୍ତ୍ତନ ସଂରକ୍ଷଣ କରନ୍ତୁ',
      logout: 'ଲଗଆଉଟ',
      language: 'ଭାଷା',
      localStorageInfo:
        'ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ ସୂଚନା ଡିଭାଇସରେ ସ୍ଥାନୀୟ ଭାବେ ସଂରକ୍ଷିତ ଅଛି।',
      stored: 'ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ ସୂଚନା ଡିଭାଇସରେ ସ୍ଥାନୀୟ ଭାବେ ସଂରକ୍ଷିତ ଅଛି।',
      updated: 'ପ୍ରୋଫାଇଲ ଅପଡେଟ ହୋଇଛି',
      saved: 'ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ ସଫଳତାର ସହ ସଂରକ୍ଷିତ ହୋଇଛି।',
      error: 'ତ୍ରୁଟି',
      logoutFailed: 'ଲଗଆଉଟ ବିଫଳ',
      name: 'ନାମ',
      age: 'ବୟସ',
      year: 'ବର୍ଷ',
      height: 'ଉଚ୍ଚତା',
      weight: 'ଓଜନ',
      cm: 'ସେ.ମି.',
      kg: 'କି.ଗ୍ରା.',
      bmi: 'BMI',
      bmr: 'BMR',
      calPerDay: 'କ୍ୟାଲୋରୀ/ଦିନ',
      gender: 'ଲିଙ୍ଗ',
      genderOptions: {
        male: 'ପୁରୁଷ',
        female: 'ମହିଳା',
        other: 'ଅନ୍ୟ',
        'prefer not to say': 'କହିବାକୁ ଇଚ୍ଛା ନାହିଁ'
      }
    },

    reminder: {
      title: 'ସ୍ମରଣିକା',
      medicineName: 'ଔଷଧର ନାମ',
      selectTime: 'ସମୟ ବାଛନ୍ତୁ',
      breakfast: 'ଜଳଖିଆ',
      lunch: 'ମଧ୍ୟାହ୍ନ ଭୋଜନ',
      dinner: 'ରାତ୍ରି ଭୋଜନ',
      custom: 'କଷ୍ଟମ',

      beforeAfterFood: 'ଖାଦ୍ୟ ପୂର୍ବରୁ / ପରେ',
      before: 'ପୂର୍ବରୁ',
      after: 'ପରେ',
      beforeFood: 'ଖାଦ୍ୟ ପୂର୍ବରୁ',
      afterFood: 'ଖାଦ୍ୟ ପରେ',

      reminderOffset: 'ସ୍ମରଣିକା ବ୍ୟବଧାନ',
      min: 'ମିନିଟ',

      endDateOptional: 'ଶେଷ ତାରିଖ (ଇଚ୍ଛାଧୀନ)',
      selectEndDate: 'ଶେଷ ତାରିଖ ବାଛନ୍ତୁ',

      saveReminder: 'ସ୍ମରଣିକା ସଂରକ୍ଷଣ କରନ୍ତୁ',

      reminders: 'ସ୍ମରଣିକାଗୁଡ଼ିକ',
      noRemindersYet: 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ସ୍ମରଣିକା ନାହିଁ।',
      unknown: 'ଅଜ୍ଞାତ',

      daily: 'ଦୈନିକ',
      oneTime: 'ଥରେ',
      ends: 'ସମାପ୍ତ:',
      status: 'ସ୍ଥିତି:',

      pending: 'ବିଚାରାଧୀନ',
      taken: 'ନିଆଯାଇଛି',
      missed: 'ଛାଡ଼ି ଯାଇଛି',

      medicineReminder: 'ଔଷଧ ସ୍ମରଣିକା',
      medicineReminders: 'ଔଷଧ ସ୍ମରଣିକାଗୁଡ଼ିକ',
      take: 'ନିଅନ୍ତୁ',

      missingField: 'ତଥ୍ୟ ଅପୂର୍ଣ୍ଣ',
      enterMedicine: 'ଦୟାକରି ଔଷଧର ନାମ ଦିଅନ୍ତୁ।',

      invalidTime: 'ଅବୈଧ ସମୟ',
      selectValidTime: 'ଦୟାକରି ଏକ ବୈଧ ସ୍ମରଣିକା ସମୟ ବାଛନ୍ତୁ।',

      invalidEndDate: 'ଅବୈଧ ଶେଷ ତାରିଖ',
      endDateFuture: 'ଶେଷ ତାରିଖ ଆଜି କିମ୍ବା ଭବିଷ୍ୟତର ତାରିଖ ହେବା ଆବଶ୍ୟକ।',

      reminderSaved: 'ସ୍ମରଣିକା ସଂରକ୍ଷିତ ହୋଇଛି',
      scheduled: 'ଆପଣଙ୍କ ଔଷଧ ସ୍ମରଣିକା ନିର୍ଦ୍ଧାରିତ ହୋଇଛି।',
      savedNoNotifications:
        'ଆପଣଙ୍କ ସ୍ମରଣିକା ସଂରକ୍ଷିତ ହୋଇଛି, କିନ୍ତୁ ବର୍ତ୍ତମାନ ପରିବେଶରେ ବିଜ୍ଞପ୍ତି ଉପଲବ୍ଧ ନାହିଁ।',

      storageError: 'ଷ୍ଟୋରେଜ୍ ତ୍ରୁଟି',
      unableToSave: 'ଆପଣଙ୍କ ସ୍ମରଣିକା ସଂରକ୍ଷଣ କରିହେଲା ନାହିଁ।',

      noReminders: 'କୌଣସି ସ୍ମରଣିକା ନାହିଁ',
      noRemindersToShare: 'ସେୟାର କରିବା ପାଇଁ କୌଣସି ସ୍ମରଣିକା ନାହିଁ।',

      myMedicineReminders: 'ମୋର ଔଷଧ ସ୍ମରଣିକାଗୁଡ଼ିକ',

      shareFailed: 'ସେୟାର ବିଫଳ',
      unableToShare: 'ସ୍ମରଣିକାଗୁଡ଼ିକ ସେୟାର କରିହେଲା ନାହିଁ।'
    },

    maps: {
      title: 'ମାନଚିତ୍ର',
      subtitle: 'ଆପଣଙ୍କ ବର୍ତ୍ତମାନ ସ୍ଥାନ ନିକଟସ୍ଥ ଫାର୍ମାସି',
      gettingLocation: 'ଆପଣଙ୍କ ସ୍ଥାନ ପାଇଯାଉଛି...',
      loadingShops: 'ନିକଟସ୍ଥ ମେଡିକାଲ୍ ଦୋକାନ ଲୋଡ୍ ହେଉଛି...',
      medicalShop: 'ମେଡିକାଲ୍ ଦୋକାନ',
      pharmacy: 'ଫାର୍ମାସି',
      pharmacyNearby: 'ନିକଟସ୍ଥ ଫାର୍ମାସି',
      addressNotAvailable: 'ଠିକଣା ଉପଲବ୍ଧ ନାହିଁ',
      permissionRequired: 'ଅନୁମତି ଆବଶ୍ୟକ',
      locationPermission: 'ସ୍ଥାନ ଅନୁମତି ଆବଶ୍ୟକ।',
      fetchError: 'ନିକଟସ୍ଥ ମେଡିକାଲ୍ ଦୋକାନଗୁଡ଼ିକୁ ପାଇହେଲା ନାହିଁ।',
      locationError: 'ସ୍ଥାନ ପାଇହେଲା ନାହିଁ।',
      openMapsError: 'ମାପ୍ସ ଆପ୍ ଖୋଲିହେଲା ନାହିଁ।',
      directionsTo: '{{name}} ପାଇଁ ଦିଗନିର୍ଦ୍ଦେଶ'
    },

    medicine: {
      search: 'ଔଷଧ ଖୋଜନ୍ତୁ',
      searchPlaceholder: 'ଔଷଧର ନାମ ଲେଖନ୍ତୁ',
      suggestions: 'ପରାମର୍ଶ',
      history: 'ସନ୍ଧାନ ଇତିହାସ',
      clearHistory: 'ଇତିହାସ ସଫା କରନ୍ତୁ',
      details: 'ଔଷଧ ବିବରଣୀ',
      substitutes: 'ପରାମର୍ଶିତ ବିକଳ୍ପ ଔଷଧ',
      price: 'ମୂଲ୍ୟ',
      close: 'ବନ୍ଦ କରନ୍ତୁ',
      noResults: 'କୌଣସି ଔଷଧ ମିଳିଲା ନାହିଁ।'
    },

    med: {
      medicalEnquiry: 'ଚିକିତ୍ସା ସମ୍ବନ୍ଧୀୟ ପଚରାଉଚରା',
      tabletName: 'ଟାବଲେଟ୍ ନାମ',
      enterTabletName: 'ଟାବଲେଟ୍ ନାମ ଲେଖନ୍ତୁ',
      search: 'ସନ୍ଧାନ କରନ୍ତୁ',
      searchHistory: 'ସନ୍ଧାନ ଇତିହାସ',
      noHistory: 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଇତିହାସ ନାହିଁ',
      suggested: 'ପରାମର୍ଶିତ',

      manufacturer: 'ନିର୍ମାତା',
      price: 'ମୂଲ୍ୟ',
      type: 'ପ୍ରକାର',
      packaging: 'ପ୍ୟାକେଜିଂ',
      composition1: 'ଉପାଦାନ ୧',
      composition2: 'ଉପାଦାନ ୨',
      sideEffects: 'ପାର୍ଶ୍ୱ ପ୍ରତିକ୍ରିୟା',
      use: 'ବ୍ୟବହାର',
      chemicalClass: 'ରାସାୟନିକ ଶ୍ରେଣୀ',
      habitForming: 'ଅଭ୍ୟାସ ସୃଷ୍ଟିକାରୀ',
      therapeuticClass: 'ଚିକିତ୍ସା ଶ୍ରେଣୀ',
      actionClass: 'କାର୍ଯ୍ୟ ଶ୍ରେଣୀ',
      close: 'ବନ୍ଦ କରନ୍ତୁ'
    },

    common: {
      cancel: 'ବାତିଲ',
      close: 'ବନ୍ଦ',
      done: 'ସମାପ୍ତ',
      save: 'ସଂରକ୍ଷଣ କରନ୍ତୁ',
      delete: 'ଡିଲିଟ୍ କରନ୍ତୁ',
      edit: 'ସମ୍ପାଦନ କରନ୍ତୁ',
      error: 'ତ୍ରୁଟି',
      success: 'ସଫଳତା',
      loading: 'ଲୋଡ୍ ହେଉଛି...',
      retry: 'ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ',
      yes: 'ହଁ',
      no: 'ନା'
    }
  }
}

// =========================================================
// FALLBACK LANGUAGE DATA
// =========================================================
//
// Any missing key automatically falls back to English.
// =========================================================

// =========================================================
// CONTEXT
// =========================================================

const I18nContext = createContext(null)

// =========================================================
// HELPERS
// =========================================================

function getNestedValue (obj, path) {
  if (!obj || !path) {
    return undefined
  }

  return path.split('.').reduce((value, key) => value?.[key], obj)
}

// ---------------------------------------------------------
// Create a stable ID for the logged-in user
// ---------------------------------------------------------

function getUserId (user) {
  return String(
    user?.id ||
    user?._id ||
    user?.email ||
    user?.username ||
    'guest'
  )
    .trim()
    .toLowerCase()
}

// ---------------------------------------------------------
// Read loggedUser
// ---------------------------------------------------------

export async function getLoggedUser () {
  try {
    if (Platform.OS === 'web') {
      if (
        typeof window === 'undefined' ||
        !window.localStorage
      ) {
        return null
      }

      const raw =
        window.localStorage.getItem('loggedUser')

      return raw ? JSON.parse(raw) : null
    }

    const raw =
      await AsyncStorage.getItem('loggedUser')

    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.log(
      'Unable to read loggedUser:',
      error
    )

    return null
  }
}

// =========================================================
// STORAGE HELPERS
// =========================================================

async function getStorage (key) {
  try {
    if (Platform.OS === 'web') {
      if (
        typeof window === 'undefined' ||
        !window.localStorage
      ) {
        return null
      }

      return window.localStorage.getItem(key)
    }

    return await AsyncStorage.getItem(key)
  } catch (error) {
    console.log(
      'Language storage read error:',
      error
    )

    return null
  }
}

async function setStorage (key, value) {
  try {
    if (Platform.OS === 'web') {
      if (
        typeof window === 'undefined' ||
        !window.localStorage
      ) {
        return
      }

      window.localStorage.setItem(
        key,
        value
      )

      return
    }

    await AsyncStorage.setItem(
      key,
      value
    )
  } catch (error) {
    console.log(
      'Language storage write error:',
      error
    )
  }
}

// =========================================================
// STORAGE KEY HELPERS
// =========================================================

export function getLanguageStorageKey (user) {
  return `${LANGUAGE_VALUE_PREFIX}${getUserId(user)}`
}

export function getLanguageSetupKey (user) {
  return `${LANGUAGE_SETUP_PREFIX}${getUserId(user)}`
}

// =========================================================
// FIRST-LOGIN LANGUAGE SETUP
// =========================================================

export async function hasLanguageSetup (user) {
  if (!user) {
    return false
  }

  const value = await getStorage(
    getLanguageSetupKey(user)
  )

  return value === 'true'
}

export async function markLanguageSetup (user) {
  if (!user) {
    return
  }

  await setStorage(
    getLanguageSetupKey(user),
    'true'
  )
}

// =========================================================
// LANGUAGE PROVIDER
// =========================================================

export function LanguageProvider ({ children }) {
  const [language, setLanguageState] =
    useState('en')

  const [user, setUser] =
    useState(null)

  const [ready, setReady] =
    useState(false)

  // -------------------------------------------------------
  // Load language for CURRENT logged-in user
  // -------------------------------------------------------

  const loadLanguage = async () => {
    try {
      // IMPORTANT:
      // Always read loggedUser again from storage.
      // Do not rely on the provider's old `user` state.
      const loggedUser =
        await getLoggedUser()

      // Update provider user state
      setUser(loggedUser || null)

      // ---------------------------------------------------
      // No logged-in user
      // ---------------------------------------------------

      if (!loggedUser) {
        setLanguageState('en')
        setReady(true)
        return
      }

      // ---------------------------------------------------
      // Get THIS user's language key
      // ---------------------------------------------------

      const storageKey =
        getLanguageStorageKey(loggedUser)

      const saved =
        await getStorage(storageKey)

      // ---------------------------------------------------
      // Restore THIS user's language
      // ---------------------------------------------------

      if (
        saved &&
        translations[saved]
      ) {
        setLanguageState(saved)
      } else {
        setLanguageState('en')
      }

      setReady(true)

      console.log(
        'Language loaded for:',
        getUserId(loggedUser),
        '=>',
        saved || 'en'
      )
    } catch (error) {
      console.log(
        'Language loading error:',
        error
      )

      setUser(null)
      setLanguageState('en')
      setReady(true)
    }
  }

  // -------------------------------------------------------
  // Initial load
  // -------------------------------------------------------

  useEffect(() => {
    loadLanguage()
  }, [])

  // -------------------------------------------------------
  // Change language
  // -------------------------------------------------------

  const setLanguage = async code => {
    if (
      !code ||
      !translations[code]
    ) {
      return
    }

    // -----------------------------------------------------
    // IMPORTANT:
    // Read the CURRENT logged-in user directly.
    // Never use the provider's potentially stale `user`.
    // -----------------------------------------------------

    const currentUser =
      await getLoggedUser()

    // -----------------------------------------------------
    // No logged-in user
    // -----------------------------------------------------

    if (!currentUser) {
      setUser(null)
      setLanguageState(code)
      return
    }

    // -----------------------------------------------------
    // Determine current user's storage key
    // -----------------------------------------------------

    const storageKey =
      getLanguageStorageKey(currentUser)

    // -----------------------------------------------------
    // Save language FIRST
    // -----------------------------------------------------

    await setStorage(
      storageKey,
      code
    )

    // -----------------------------------------------------
    // Update provider state
    // -----------------------------------------------------

    setUser(currentUser)
    setLanguageState(code)

    console.log(
      'Language saved for:',
      getUserId(currentUser),
      '=>',
      code
    )
  }

  // -------------------------------------------------------
  // Translation function
  // -------------------------------------------------------

  const t = (key, params = {}) => {
    if (!key) {
      return ''
    }

    // -----------------------------------------------------
    // Current language
    // -----------------------------------------------------

    const currentValue =
      getNestedValue(
        translations[language],
        key
      )

    // -----------------------------------------------------
    // English fallback
    // -----------------------------------------------------

    const englishValue =
      getNestedValue(
        translations.en,
        key
      )

    const value =
      currentValue ??
      englishValue ??
      key

    // -----------------------------------------------------
    // Only strings can be translated
    // -----------------------------------------------------

    if (
      typeof value !== 'string'
    ) {
      return key
    }

    // -----------------------------------------------------
    // Replace {{parameters}}
    // -----------------------------------------------------

    return Object.entries(
      params
    ).reduce(
      (
        result,
        [param, replacement]
      ) =>
        result.replace(
          new RegExp(
            `{{${param}}}`,
            'g'
          ),
          String(replacement)
        ),
      value
    )
  }

  // -------------------------------------------------------
  // Context value
  // -------------------------------------------------------

  const contextValue = useMemo(
    () => ({
      t,

      language,

      setLanguage,

      languages: LANGUAGES,

      ready,

      user,

      refreshLanguage: loadLanguage
    }),
    [
      language,
      ready,
      user
    ]
  )

  return (
    <I18nContext.Provider
      value={contextValue}
    >
      {children}
    </I18nContext.Provider>
  )
}

// =========================================================
// TRANSLATION HOOK
// =========================================================

export function useTranslation () {
  const context =
    useContext(I18nContext)

  if (!context) {
    throw new Error(
      'useTranslation must be used inside LanguageProvider'
    )
  }

  return context
}

