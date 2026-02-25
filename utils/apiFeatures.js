class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.search
      ? {
          name: {
            $regex: this.queryStr.search,
            $options: 'i', // 'i' signifie insensible à la casse (trouvera "bio" ou "Bio")
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

 filter() {
    const queryObj = { ...this.queryStr };
    const excludedFields = ['search', 'sort', 'page', 'limit'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Cette version gère à la fois les objets { price: { lt: '20' } } 
    // ET les clés plates comme 'price[lt]': '20'
    let finalQuery = {};
    
    for (let key in queryObj) {
      if (key.includes('[') && key.includes(']')) {
        // Transforme 'price[lt]' en { price: { $lt: value } }
        const mainKey = key.split('[')[0];
        const operator = key.split('[')[1].split(']')[0];
        finalQuery[mainKey] = { ...finalQuery[mainKey], [`$${operator}`]: queryObj[key] };
      } else if (typeof queryObj[key] === 'object') {
        // Transforme { price: { lt: '20' } } en { price: { $lt: '20' } }
        let subObj = {};
        for (let op in queryObj[key]) {
          subObj[`$${op}`] = queryObj[key][op];
        }
        finalQuery[key] = subObj;
      } else {
        finalQuery[key] = queryObj[key];
      }
    }

    this.query = this.query.find(finalQuery);
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
}

module.exports = APIFeatures;