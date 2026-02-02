class APIFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        let keyword = this.queryStr.keyword ? {
            name : {
                $regex : this.queryStr.keyword,
                $options : 'i' // Will convert case insensitive
            }
        } : {};

        // this.query = this.query.find({...keyword})
        return this;
    }

    filter(){
        const queryStrCopy = {...this.queryStr};

        //before 
        console.log(queryStrCopy);

        const removeFields = ['keyword', 'limit', 'page'];
        removeFields.forEach(field => delete queryStrCopy[field]);
        let queryStr = JSON.stringify(queryStrCopy);
        queryStr =  queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)


        //after
        console.log(queryStrCopy);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    paginate(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);
        this.query.limit(resPerPage).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;