class ActiveFilters {
    constructor({
      maximumDistance,
      minimumDistance,
      maximumAge,
      minimumAge,
      preference,
      uid,
      filterId,
    }) {
      this.maximumDistance = maximumDistance;
      this.minimumDistance = minimumDistance;
      this.maximumAge = maximumAge;
      this.minimumAge = minimumAge;
      this.preference = preference;
      this.uid = uid;
      this.filterId = filterId;
    }
  
  }


  
  
  module.exports = ActiveFilters;
  