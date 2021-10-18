create table user(
	userId int(20) not null auto_increment,
	userEmail varchar(50) not null unique,
	userPw varchar(40) not null,
    userNickname varchar(40) not null unique,
	primary key(userId),
	index(userNickname)
);
create table post(
	postId int(20) not null auto_increment,
	postTitle varchar(50) not null,
	userNickname varchar(40),
	postIntro varchar(50),
	postContent varchar(50) not null,
	postImage text,
	postTime varchar(50) not null,
    primary key(postId),
    foreign key(userNickname)REFERENCES user(userNickname) ON UPDATE CASCADE,
    index(postId)
);
create table comment(
    commentId int(20) not null auto_increment,
    commentTime varchar(50) not null,
    commentContent varchar(255) not null,
    userNickname varchar(40),
    postId int(20),
    primary key(commentId),
    foreign key(postId)REFERENCES post(postId) ON DELETE CASCADE,
    foreign key(userNickname)REFERENCES user(userNickname) ON UPDATE CASCADE,
);
create table profile(
    profileId int(20) not null auto_increment,
    userIntro varchar(255),
    userImage text,
    userId int(20),
    primary key(profileId),
    foreign key(userId)REFERENCES user(userId) ON UPDATE CASCADE ON DELETE CASCADE
)
