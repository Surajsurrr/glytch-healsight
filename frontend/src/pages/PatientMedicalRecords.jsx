import React from 'react';
import MedicalRecords from './MedicalRecords';

// Wrapper page so sidebar can point to /medical-records
const PatientMedicalRecords = () => {
  return (
    <div>
      <MedicalRecords />
    </div>
  );
};

export default PatientMedicalRecords;
