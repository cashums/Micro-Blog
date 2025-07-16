import { auth, firestore } from '@/firebaseResources.js'
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'

export async function followUser(targetUserId) {
  if (!auth.currentUser) {
    throw new Error('Must be logged in to follow users')
  }

  const currentUserId = auth.currentUser.uid

  try {
    // get target user's posts
    const targetUserDoc = await getDoc(doc(firestore, 'users', targetUserId))
    const targetUserPosts = targetUserDoc.data().posts || []

    // update current user's document
    await updateDoc(doc(firestore, 'users', currentUserId), {
      following: arrayUnion(targetUserId),
      feed: arrayUnion(...targetUserPosts),
    })

    // update target user's document
    await updateDoc(doc(firestore, 'users', targetUserId), {
      followers: arrayUnion(currentUserId),
    })

    return { success: true }
  }
  catch (error) {
    console.error('Error following user:', error)
    throw error
  }
}
