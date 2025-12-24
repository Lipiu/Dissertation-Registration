export async function createUser(model, user){
    const duplicateUser = await model.findOne({ email: user.email });
    if(duplicateUser){
        throw new Error('User with this email already exists');
    }
    else{
        return await model.create(user);
    }
}

export async function getUserById(model, id){
    const user = await model.findByPk(id);
    if(!user){
        throw new Error('User not found');
    }

    return user;
}

export async function getUserByEmail(model, email){
    const user = await model.findOne({ where: { email } });
    if(!user){
        throw new Error('User email not found');
    }
    return user;
}

export async function getUserByEmailAndCheckPassword(model, email, password){
    try{
        const user = await getUserByEmail(model, email);
        const isValidPassword = await user.validatePassword(password);
        if(!isValidPassword){
            throw new Error('Invalid password');
        }
        return user;
    }
    catch(e){
        throw e;
    }
}

export async function deleteUserById(model, id){
    const user = await getUserById(model, id);
    await user.destroy();
}
