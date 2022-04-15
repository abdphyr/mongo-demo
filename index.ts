import { Schema, connect, model, Document, Model, Query } from 'mongoose';

interface IBook extends Document {
    name: string;
    author: string;
    tags: string[];
    date: number;
    isPublished: boolean;
    price: number;
    category: 'classic' | 'biography' | 'science';
}

const bookSchema = new Schema<IBook>({
    name: { type: String, required: true },
    author: { type: String, required: true },
    tags: {
        type: [String],
        validate: {
            validator: (val: string[], callback) => {
                setTimeout(() => {
                    const result = val && val.length > 0
                    callback(result)
                }, 3000)
            },
            message: 'Kitobning kamida bitta tegi bo\'lishi kerak'
        }
    },
    date: { type: Number, required: true },
    isPublished: { type: Boolean },
    price: {
        type: Number,
        required: true,
        min: 10,
        max: 300,
        set: (val: number) => Math.round(val),
        get: (val: number) => Math.round(val)
    },
    category: {
        type: String,
        required: true,
        enum: ['classic', 'biography', 'science'],
        minlength: 2,
        maxlength: 22,
        lowercase: true,
        trim: true,
    }
})


const Book = model<IBook>("Bookss", bookSchema);

const connectdb = async () => {
    await connect('mongodb://localhost/test')
        .then(() => {
            console.log("MongoDb ga ulanish hosil qilindi ...")
        })
        .catch(err => {
            console.error("MongoDb ga ulanish vaqtida xato ro'y berdi", err)
        })
}

const addBook = async () => {
    const book = new Book({
        name: 'Node js to\'liq qollanma',
        author: 'Farhod Dadajonov',
        tags: ['js', 'node'],
        date: Date.now(),
        isPublished: true,
        price: 222,
        category: 'classic'
    })
    try {
        await book.validate()
        // await book.save()
    }
    catch (ex) {
        console.log(ex)
    }
}

const findBook = async () => {
    const pageNumber = 3;
    const pageSize = 10
    // const books = await Book.find()
    // const books = await Book.find({ price: { $gt: 10, $lt: 10 } })
    // const books = await Book.find({ price: { $in: [10, 20, 30] } })
    const books = await Book
        .find({ author: /^F/ }) // Muallif ning ismi F harfidan boshlangan hujjatlarni olib beradi
        .find({ author: /od$/i }) // Muallif ning ismi "od" bilan tugagan hujjatlarni olib beradi
        .find({ author: /.*ham.*/i }) // Muallif ning ismida "ham" bor hujjatlarni olib beradi
        .find({ author: 'Farhod Dadajonov' })
        .or([{ author: 'Samar Badriddinov' }, { author: 'Farhod Dadajonov' }])
        .countDocuments()
        .and([{}])
        .limit(2)
        .skip((pageNumber - 1) * pageSize)
        .sort({ name: -1 })
        .select({ name: 0 })
    console.log(books)
}

const updateBook = async (id: string) => {
    const book = await Book.updateOne({ _id: id })
    if (!book) {
        return;
    }
    // book.isPublished = true
    // book.author = 'Farhod'
    // book.set({
    //     isPublished:true,
    //     author:"Anvar Narzullayev"
    // })
    console.log(book)
    // const updatedBook = await book.save()
    // console.log(updatedBook)
}

const deleteBook = async (id: string) => {
    await Book.deleteOne({ _id: id })
    // const result = await Book.deleteOne({ isPublished:true })
    // const result = await Book.findByIdAndRemove(id)
    // console.log(result)
}

const run = async () => {
    connectdb()
    addBook()
    // findBook()
    // updateBook('6257156129b64377a892e100')
    // deleteBook('62574120fd99d69c12b25994')
}

run()