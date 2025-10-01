'use server';

import { adminDb, FieldValue } from '@/lib/firebase-admin';
import { GroupPost, GroupComment, PostLike } from '@/lib/types';
import { getUserById } from './users';

export async function createGroupPost(groupId: string, authorId: string, content: string) {
  try {
    if (!adminDb) {
      throw new Error('Admin DB not available');
    }

    // Validate content
    if (!content.trim()) {
      throw new Error('Nội dung bài viết không được để trống');
    }

    if (content.length > 2000) {
      throw new Error('Nội dung bài viết không được quá 2000 ký tự');
    }

    // Check if user is member of the group (use lenient approach since leftAt might be undefined)
    const memberQuery = adminDb.collection('groupMembers')
      .where('groupId', '==', groupId)
      .where('userId', '==', authorId)
      .limit(1);

    const memberSnapshot = await memberQuery.get();
    
    if (memberSnapshot.empty) {
      throw new Error('Bạn không phải thành viên của nhóm này');
    }
    
    // Check if any of the results have leftAt as null/undefined (active members)
    const activeMembers = memberSnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.leftAt || data.leftAt === null;
    });
    
    if (activeMembers.length === 0) {
      throw new Error('Bạn không phải thành viên của nhóm này');
    }

    // Create post
    const postData = {
      groupId,
      authorId,
      content: content.trim(),
      createdAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
    };

    const postRef = await adminDb.collection('groupPosts').add(postData);
    
    return {
      success: true,
      postId: postRef.id,
    };
  } catch (error) {
    console.error('Error creating group post:', error);
    throw new Error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo bài viết');
  }
}

export async function getGroupPosts(groupId: string, limit: number = 20, lastDoc?: any) {
  try {
    if (!adminDb) {
      throw new Error('Admin DB not available');
    }

    let query = adminDb.collection('groupPosts')
      .where('groupId', '==', groupId)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const postsSnapshot = await query.get();
    const posts: GroupPost[] = [];

    for (const doc of postsSnapshot.docs) {
      const postData = doc.data();
      
      posts.push({
        id: doc.id,
        groupId: postData.groupId,
        authorId: postData.authorId,
        content: postData.content,
        createdAt: postData.createdAt?.toDate ? postData.createdAt.toDate() : new Date(),
        updatedAt: postData.updatedAt?.toDate ? postData.updatedAt.toDate() : undefined,
        likesCount: postData.likesCount || 0,
        commentsCount: postData.commentsCount || 0,
        authorName: 'Người dùng', // Temporarily remove user lookup to fix recursion
        authorAvatar: undefined,
      });
    }

    return {
      posts,
      hasMore: postsSnapshot.docs.length === limit,
      lastDoc: null, // Don't return Firestore snapshot - causes serialization issues
    };
  } catch (error) {
    console.error('Error getting group posts:', error);
    // Graceful fallback while Firestore index is building or missing
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('FAILED_PRECONDITION') || errorMessage.includes('requires an index')) {
      console.warn('Group posts index not ready yet. Returning empty list temporarily.');
      return {
        posts: [],
        hasMore: false,
        lastDoc: null,
      };
    }
    throw new Error('Có lỗi xảy ra khi tải bài viết');
  }
}

export async function likeGroupPost(postId: string, userId: string) {
  console.log('=== LIKE GROUP POST FUNCTION CALLED ===');
  console.log('likeGroupPost called with:', { postId, userId });
  console.log('Function execution started at:', new Date().toISOString());
  
  try {
    console.log('Entering try block...');
    
    if (!adminDb) {
      console.error('Admin DB not available');
      return { success: false, message: 'Database not available' };
    }

    if (!postId || !userId) {
      console.error('Missing required parameters:', { postId, userId });
      return { success: false, message: 'Missing required parameters' };
    }

    console.log('Parameters validated, proceeding...');

    // Check if post exists and get group info
    console.log('Checking if post exists...');
    const postDoc = await adminDb.collection('groupPosts').doc(postId).get();
    if (!postDoc.exists) {
      console.error('Post not found:', postId);
      return { success: false, message: 'Bài viết không tồn tại' };
    }

    const postData = postDoc.data();
    const groupId = postData?.groupId;
    console.log('Post group ID:', groupId);

    if (!groupId) {
      console.error('Post has no group ID');
      return { success: false, message: 'Bài viết không thuộc nhóm nào' };
    }

    // Check if user is member of the group
    console.log('Checking group membership...');
    const memberQuery = adminDb.collection('groupMembers')
      .where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .limit(1);

    const memberSnapshot = await memberQuery.get();
    console.log('Member query result:', memberSnapshot.size, 'docs found');
    
    if (memberSnapshot.empty) {
      console.error('User is not a member of the group');
      return { success: false, message: 'Bạn không phải thành viên của nhóm này' };
    }

    console.log('User is a member, proceeding with like...');

    // Simple like implementation - just add a like without checking existing ones
    console.log('Adding like directly...');
    
    try {
      console.log('Attempting to add like with data:', {
        postId,
        userId,
        createdAt: new Date()
      });
      
      const likeData = {
        postId,
        userId,
        createdAt: new Date(),
      };
      
      console.log('Like data prepared:', likeData);
      
      await adminDb.collection('postLikes').add(likeData);
      console.log('Like added successfully');

      // Increment likes count
      const postRef = adminDb.collection('groupPosts').doc(postId);
      await postRef.update({
        likesCount: FieldValue.increment(1)
      });
      console.log('Like count incremented');

      return { success: true, liked: true };
    } catch (addError: any) {
      console.error('Error adding like:', addError);
      console.error('Add error details:', {
        code: addError.code,
        message: addError.message,
        details: addError.details
      });
      
      if (addError.code === 9 && addError.details?.includes('The query requires an index. That index is currently building')) {
        return { success: false, message: 'Chức năng thích đang được cập nhật, vui lòng thử lại sau' };
      }
      
      return { success: false, message: 'Không thể thêm like' };
    }
  } catch (error: any) {
    console.error('Error liking post:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      stack: error.stack
    });
    
    return { success: false, message: 'Có lỗi xảy ra khi thích bài viết' };
  }
}

export async function getPostLikes(postId: string, userId?: string) {
  try {
    if (!adminDb) {
      throw new Error('Admin DB not available');
    }

    const likesSnapshot = await adminDb.collection('postLikes')
      .where('postId', '==', postId)
      .get();

    const likes: PostLike[] = [];
    let isLiked = false;

    for (const doc of likesSnapshot.docs) {
      const likeData = doc.data();
      likes.push({
        id: doc.id,
        postId: likeData.postId,
        userId: likeData.userId,
        createdAt: likeData.createdAt.toDate(),
      });

      if (userId && likeData.userId === userId) {
        isLiked = true;
      }
    }

    return {
      likes,
      isLiked,
      count: likes.length,
    };
  } catch (error) {
    console.error('Error getting post likes:', error);
    throw new Error('Có lỗi xảy ra khi tải lượt thích');
  }
}

export async function createGroupComment(postId: string, authorId: string, content: string) {
  try {
    console.log('createGroupComment called with:', { postId, authorId, content: content.substring(0, 50) + '...' });
    
    if (!adminDb) {
      console.error('Admin DB not available');
      throw new Error('Admin DB not available');
    }

    if (!postId || !authorId || !content.trim()) {
      console.error('Missing required parameters:', { postId, authorId, content: !!content });
      throw new Error('Missing required parameters');
    }

    if (content.length > 500) {
      throw new Error('Nội dung bình luận không được quá 500 ký tự');
    }

    // Check if post exists and get group info
    console.log('Checking if post exists...');
    const postDoc = await adminDb.collection('groupPosts').doc(postId).get();
    if (!postDoc.exists) {
      console.error('Post not found:', postId);
      throw new Error('Bài viết không tồn tại');
    }

    const postData = postDoc.data();
    const groupId = postData?.groupId;
    console.log('Post group ID:', groupId);

    if (!groupId) {
      console.error('Post has no group ID');
      throw new Error('Bài viết không thuộc nhóm nào');
    }

    // Check if user is member of the group
    console.log('Checking group membership...');
    const memberQuery = adminDb.collection('groupMembers')
      .where('groupId', '==', groupId)
      .where('userId', '==', authorId)
      .limit(1);

    const memberSnapshot = await memberQuery.get();
    console.log('Member query result:', memberSnapshot.size, 'docs found');
    
    if (memberSnapshot.empty) {
      console.error('User is not a member of the group');
      throw new Error('Bạn không phải thành viên của nhóm này');
    }

    console.log('User is a member, creating comment...');

    // Create comment
    const commentData = {
      postId,
      authorId,
      content: content.trim(),
      createdAt: new Date(),
    };

    const commentRef = await adminDb.collection('groupComments').add(commentData);
    console.log('Comment created with ID:', commentRef.id);

    // Increment comments count
    const postRef = adminDb.collection('groupPosts').doc(postId);
    await postRef.update({
      commentsCount: FieldValue.increment(1)
    });
    console.log('Comment count incremented');

    return {
      success: true,
      commentId: commentRef.id,
    };
  } catch (error: any) {
    console.error('Error creating group comment:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details
    });
    throw new Error('Có lỗi xảy ra khi tạo bình luận');
  }
}
