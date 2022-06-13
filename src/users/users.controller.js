


export const getUserInfo = async (req, res) => {

    //call the user
    try {
        const query = {email: req.email};
        const options = { projection: { _id: 0, password: 0, status: 0 } }
        const user = await req.app.locals.ddbbClient.usersCol.findOne(query, options);
        res.json(user);

    } catch (err) {
        console.error.apply(err);
        res.sendStatus(500);
    }
}
