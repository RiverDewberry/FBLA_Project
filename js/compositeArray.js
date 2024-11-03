export class CompositeArray {
    //a class that makes objects that have typed arrays of composite types

    #bytes;//the array buffer
    #view;//the data view
    #typesOffset;//the location of each variable in this.#bytes relative to the start of the index
    #compositeSize;//the size of an instance of the composite type in bytes
    #arrayLength;//the length of the array
    #usedLength;//the length of the array that has been used

    #types;//the types in the composite types, which is stored as an Uint8Array
    //the following values in each position in the array mean the following type:
    //2 - float32
    //3 - float64
    //4 - int8
    //5 - int16
    //6 - int32
    //7 - bigInt64
    //8 - uint8
    //9 - uint16
    //10 - uint32
    //11 - bigUint64
    //as such, the following static feilds exist
    static float32 = 2;
    static float64 = 3;
    static int8 = 4;
    static int16 = 5;
    static int32 = 6;
    static bigInt64 = 7;
    static uint8 = 8;
    static uint16 = 9;
    static uint32 = 10;
    static bigUint64 = 11;

    //note: the size of each type (in bytes) can be found by "1 << (typeNumber & 3)" where 
    //typeNumber is the number that indicates the type

    constructor (types, arrayLength) {
        this.#types = new Uint8Array(types);//assigns this.#types to the provided array of types
        this.#typesOffset = new Uint8Array(types.length);//makes the array for the offset

        this.#compositeSize = 0;//initalizes the value of this.#compositeSize

        for (let i = 0; i < this.#types.length; i++) {
            this.#typesOffset[i] = this.#compositeSize;//sets the offset of each type
            this.#compositeSize += 1 << (this.#types[i] & 3);//type length formula
        }//this for loop calculates the size of the composite type

        this.#arrayLength = arrayLength;//the length of the array, I suppose this is self evident
        this.#usedLength = 0;//initalizes the value of this.#compositeSize

        this.#bytes = new ArrayBuffer(
            this.#arrayLength * this.#compositeSize
        );//allocates memory to the buffer

        this.#view = new DataView(this.#bytes);//makes the Dataview
    }

    //the following getters allow some private values to be read
    get usedLength() {
        return this.#usedLength;
    }

    get arrayLength() {
        return this.#arrayLength;
    }

    get types() {
        return this.#types;
    }

    addInstance (vals) {//adds an instance of the composite type to the buffer
        //returns 1 on success, and -1 on failure

        if(this.#usedLength < this.#arrayLength) this.#usedLength++;
        else return -1;//checks if there is space in this.#bytes,
        //and if there is marks that space as used otherwise, returns -1

        for (let i = 0; i < this.#types.length; i++) {
            this.setVal(this.#usedLength - 1, i, vals[i])
        }//sets values

        return 1;//returns 1 on success
    }

    removeInstance (index) {
        if (index >= this.#usedLength || (index < 0)) return;//returns if index is out of bounds
        this.#usedLength--;//decreases this.#usedLength by 1

        for(let i = index * this.#compositeSize; i < this.#usedLength * this.#compositeSize; i++){
            if(i + this.#compositeSize < this.#bytes.byteLength)
                this.#view.setUint8(i, this.#view.getUint8(i + this.#compositeSize));//moves values
        }//removes values at the index, and shifts values over to fill space
    }

    setVal (index, attribute, val) {
        //sets the value of an attribute in the composite type at a specific index to a vlaue

        if (index >= this.#usedLength || (index < 0)) {
            console.error("index does not exist");
            return 0;//returns 0 if index is out of bounds
	}
        if (attribute >= this.#types.length) {
            console.error("attribute does not exist");
            return 0;//returns 0 if attribute dosn't exist
	}

        const offset = this.#typesOffset[attribute] + index * this.#compositeSize;
        //the offset of the attribute in the byte array

        switch (this.#types[attribute]) {//sets the value based on the type
            case 2:
                this.#view.setFloat32(offset, val, true);
                break;
            case 3:
                this.#view.setFloat64(offset, val, true);
                break;
            case 4:
                this.#view.setInt8(offset, val);
                break;
            case 5:
                this.#view.setInt16(offset, val, true);
                break;
            case 6:
                this.#view.setInt32(offset, val, true);
                break;
            case 7:
                this.#view.setBigInt64(offset, val, true);
                break;
            case 8:
                this.#view.setUint8(offset, val);
                break;
            case 9:
                this.#view.setUint16(offset, val, true);
                break;
            case 10:
                this.#view.setUint32(offset, val, true);
                break;
            case 11:
                this.#view.setBigUint64(offset, val, true);
                break;
            default:
                break;
        }
    }

    getVal (index, attribute) {
        //gets the value of an attribute in the composite type at a specific index

        if (index >= this.#usedLength || (index < 0)) {
            console.error("index does not exist");
            return 0;//returns 0 if index is out of bounds
	}
        if (attribute >= this.#types.length) {
            console.error("attribute does not exist");
            return 0;//returns 0 if attribute dosn't exist
	}

        const offset = this.#typesOffset[attribute] + index * this.#compositeSize;
        //the offset of the attribute in the byte array

        switch (this.#types[attribute]) {//sets the value based on the type
            case 2:
                return this.#view.getFloat32(offset, true);
            case 3:
                return this.#view.getFloat64(offset, true);
            case 4:
                return this.#view.getInt8(offset);
            case 5:
                return this.#view.getInt16(offset, true);
            case 6:
                return this.#view.getInt32(offset, true);
            case 7:
                return this.#view.getBigInt64(offset, true);
            case 8:
                return this.#view.getUint8(offset);
            case 9:
                return this.#view.getUint16(offset, true);
            case 10:
                return this.#view.getUint32(offset, true);
            case 11:
                return this.#view.getBigUint64(offset, true);
            default:
                return 0;
        }
    }
}
