import React, { useState } from 'react';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';


const Test2 = () => {
    const [country, setCountry] = useState('');
    const [region, setRegion] = useState('');

    return (
        <div>
            <CountryDropdown
                showDefaultOption={false}
                value={country}
                onChange={setCountry} />
            <RegionDropdown
                showDefaultOption={false}
                country={country}
                value={region}
                onChange={setRegion} />
        </div>
    );
}
export default Test2;