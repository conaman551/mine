class User {
  constructor({
    uid,
    phoneNumber,
    dob,
    firstName,
    lastName,
    gender,
    genderPref,
    location,
    category1Id,
    category2Id,
    category3Id,
    category4Id,
  }) {
    this.uid = uid;
    this.phoneNumber = phoneNumber;
    this.dob = dob;
    this.firstName = firstName;
    this.lastName = lastName;
    this.gender = gender;
    this.genderPref = genderPref;
    this.location = location;
    this.category1Id = category1Id;
    this.category2Id = category2Id;
    this.category3Id = category3Id;
    this.category4Id = category4Id;
  }

}

module.exports = User;