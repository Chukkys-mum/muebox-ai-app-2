'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import FileUpload from '../../../components/file-management/FileUpload';
import PhoneInput from 'react-phone-input-2'; // Country code dropdown
import 'react-phone-input-2/lib/style.css'; // Styles for phone input
import SupportedLanguages from '../../../components/common/SupportedLanguages';
import SupportedCurrencies from '../../../components/common/SupportedCurrencies';
import SupportedCountryCodes from '../../../components/common/SupportedCountryCodes';



interface ProfileData {
  organisationName: string;
  organisationNumber: string;
  taxId: string;
  bannerImage: File | null;
  profileImage: File | null;
  website: string[];
  email: string;
  phoneNumber: string;
  countryCode: string; // Already present
  phoneCode: string; // Add this property
  domains: string[];
  currency: string;
  timezone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  accountType: string;
  language: string;
  headquarters: string;
  disableAds: boolean;
}


const AccountProfile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    organisationName: '',
    organisationNumber: '',
    taxId: '',
    bannerImage: null,
    profileImage: null,
    website: [],
    email: '',
    phoneNumber: '',
    countryCode: '+44', // Default UK
    phoneCode: '+44', // Default UK
    domains: [],
    currency: 'GBP', // Default currency
    timezone: 'GMT', // Default timezone
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    accountType: 'Government',
    language: 'en', // Default language
    headquarters: '',
    disableAds: false,
  }); 

  const [currencies, setCurrencies] = useState<{ value: string; label: string }[]>([]);

  // Fetch currency list and detect default currency based on location
  useEffect(() => {
    const fetchCurrencies = async () => {
      const response = [
        { value: 'USD', label: 'United States Dollar (USD)' },
        { value: 'GBP', label: 'British Pound (GBP)' },
        { value: 'EUR', label: 'Euro (EUR)' },
      ];
      setCurrencies(response);

      try {
        const location = await axios.get('https://ipapi.co/json/');
        setProfileData((prev) => ({
          ...prev,
          currency: location.data.currency || 'GBP',
        }));
      } catch {
        setProfileData((prev) => ({ ...prev, currency: 'GBP' }));
      }
    };

    fetchCurrencies();
  }, []);

  const addToList = (field: 'domains' | 'website', value: string) => {
    if (value.trim() && !profileData[field].includes(value)) {
      setProfileData((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
    }
  };

  const removeFromList = (field: 'domains' | 'website', value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== value),
    }));
  };

  const handleZipCodeLookup = async () => {
    if (!profileData.zipCode) return;
    try {
      const response = await axios.get(`https://api.postcodes.io/postcodes/${profileData.zipCode}`);
      const result = response.data.result;
      setProfileData((prev) => ({
        ...prev,
        addressLine1: result.line_1 || '',
        city: result.admin_district || '',
        state: result.region || '',
      }));
    } catch {
      alert('Invalid postcode or failed to fetch address details.');
    }
  };



  const handleSaveChanges = () => {
    console.log('Profile Data Saved:', profileData);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md">
      <h1 className="text-xl font-bold text-zinc-800 dark:text-white mb-4">Account Settings</h1>

      <div className="space-y-6">
        {/* Organisation Information */}
        <div>
          <label className="block text-sm font-medium mb-1">Organisation Name</label>
          <input
            type="text"
            value={profileData.organisationName}
            onChange={(e) => setProfileData({ ...profileData, organisationName: e.target.value })}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>

        {/* Banner Image */}
        <div>
          <label className="block text-sm font-medium mb-1">Banner Image</label>
          <FileUpload
            file={profileData.bannerImage}
            onFileChange={(file) => setProfileData({ ...profileData, bannerImage: file })}
          />
        </div>

        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium mb-1">Profile Image</label>
          <FileUpload
            file={profileData.profileImage}
            onFileChange={(file) => setProfileData({ ...profileData, profileImage: file })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Organisation Number</label>
          <input
            type="text"
            value={profileData.organisationNumber}
            onChange={(e) =>
              setProfileData({ ...profileData, organisationNumber: e.target.value })
            }
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tax ID</label>
          <input
            type="text"
            value={profileData.taxId}
            onChange={(e) => setProfileData({ ...profileData, taxId: e.target.value })}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>

        {/* Domains */}
        <div>
          <label className="block text-sm font-medium mb-1">Domains</label>
          <input
            type="text"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addToList('domains', (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
            placeholder="Add a domain and press Enter"
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {profileData.domains.map((domain, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-2"
              >
                {domain}
                <button onClick={() => removeFromList('domains', domain)}>&times;</button>
              </span>
            ))}
          </div>
        </div>

        {/* Language Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Default Language</label>
          <Select
            options={SupportedLanguages}
            classNamePrefix="react-select"
            value={SupportedLanguages.find((lang) => lang.value === profileData.language)}
            onChange={(selected) =>
              setProfileData((prev) => ({
                ...prev,
                language: selected?.value || 'en',
              }))
            }
            placeholder="Select language"
          />
        </div>


        {/* Telephone Number */}
        <div>
          <label className="block text-sm font-medium mb-1">Contact Telephone Number</label>
          <div className="flex items-center gap-2">
            <Select
              options={SupportedCountryCodes}
              classNamePrefix="react-select"
              value={SupportedCountryCodes.find((code) => code.code === profileData.phoneCode)}
              onChange={(selected) =>
                setProfileData((prev) => ({
                  ...prev,
                  phoneCode: selected?.code || '+44',
                }))
              }
              placeholder="Select country code"
              className="small-field"
            />
            <input
              type="tel"
              value={profileData.phoneNumber}
              onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        {/* Currency Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <Select
            options={SupportedCurrencies}
            classNamePrefix="react-select"
            value={SupportedCurrencies.find((currency) => currency.value === profileData.currency)}
            onChange={(selected) =>
              setProfileData((prev) => ({
                ...prev,
                currency: selected?.value || 'USD',
              }))
            }
            placeholder="Select currency"
          />
        </div>

        {/* Address Fields */}
        <div>
          <label className="block text-sm font-medium mb-1">Zip/Post Code</label>
          <input
            type="text"
            value={profileData.zipCode}
            onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
          />
          <button
            onClick={handleZipCodeLookup}
            className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-lg"
          >
            Lookup Address
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address Line 1</label>
          <input
            type="text"
            value={profileData.addressLine1}
            onChange={(e) => setProfileData({ ...profileData, addressLine1: e.target.value })}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            value={profileData.city}
            onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;
