angular.module('qoutify.controllers', [])

.controller('DashCtrl', function($scope,$http,$ionicLoading, $ionicModal,PopupNotifications,$ionicPopup, $sce, $ionicScrollDelegate, $state, $ionicSideMenuDelegate, DashFlow) {
	$ionicLoading.show({
	  template: '<ion-spinner icon="android"></ion-spinner> Loading Data...'
	});
	
	var totalLoaded = 0;
	var readyForLoad = false;
	var prevLink = '';
	var nextLink = '';
	
	var latestTimeStamp = 0;
	
	$scope.updates = [];
	
	var d = new Date("January 1, 2015 8:13:00");
	// var d = new Date();
	
	tStamp = d.getTime()/1000;
	tStamp = tStamp.toFixed(0);
	openFB.api({
		path: '/quotify/feed',
		// path: '/'+localStorage.quotify_user_id+'/home',
		// path: '/435909393097227/feed',
		params: { limit: 5 },
		success: function(user) {
			console.log(user);
			if( user.data.length == 0 ) return false;
			for(i in user.data){
				
				if( user.data[i].type == 'status' && typeof(user.data[i].message) == 'undefined' ) continue;
				
				var createTime = new Date(user.data[i].created_time);
				var videoSource = (typeof(user.data[i].source)!='undefined'?user.data[i].source:'');
				
				var commentLink = '';
				var likeLink = '';
				
				for( action in user.data[i].actions ){
					if( user.data[i].actions[action].name == 'Comment' ){
						commentLink = user.data[i].actions[action].link;
					}else if( user.data[i].actions[action].name == 'Like' ){
						likeLink = user.data[i].actions[action].link;
					}
				}
				
				$scope.updates.push({ 
					from		: user.data[i].from.id,
					post_id		: user.data[i].id,
					title		: user.data[i].from.name,
					name		: typeof(user.data[i].name)!='undefined'?user.data[i].name:'',
					content 	: user.data[i].message, 
					type 		: user.data[i].type,
					video		: videoSource,
					photo		: user.data[i].picture,
					object_id	: user.data[i].object_id,
					create_date : createTime.toDateString()+' '+createTime.toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3"),
					likes		: typeof(user.data[i].likes)!='undefined'?user.data[i].likes.data.length:0,
					comments	: typeof(user.data[i].comments)!='undefined'?user.data[i].comments.data.length:0,
					commentLink : commentLink,
					likeLink	: likeLink
				});

			}
			$ionicLoading.hide($scope.updates);
			totalLoaded++;
			nextLink = user.paging.next;
			prevLink = user.paging.previous;
			
			latestTimeStamp = new Date().getTime()/1000;
			latestTimeStamp = latestTimeStamp.toFixed(0);

		},
		error: function(error) {
			$ionicLoading.hide();
			// alert('Facebook error: ' + error.error_description);
		}
	});
		
	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		readyForLoad = true;
		$scope.$apply();
	});
	
	$scope.loadMorePost = function(){
		
		if( readyForLoad && totalLoaded >= 1 ){
			$http.get(nextLink).success(function(user) {
				console.log(user);
				for(i in user.data){
					
					var createTime = new Date(user.data[i].created_time);
					var videoSource = (typeof(user.data[i].source)!='undefined'?user.data[i].source:'');
					
					var commentLink = '';
					var likeLink = '';
					
					for( action in user.data[i].actions ){
						if( user.data[i].actions[action].name == 'Comment' ){
							commentLink = user.data[i].actions[action].link;
						}else if( user.data[i].actions[action].name == 'Like' ){
							likeLink = user.data[i].actions[action].link;
						}
					}
					
					$scope.updates.push({ 
						from		: user.data[i].from.id,
						post_id		: user.data[i].id,
						title		: user.data[i].from.name,
						name		: typeof(user.data[i].name)!='undefined'?user.data[i].name:'',
						content 	: user.data[i].message, 
						type 		: user.data[i].type,
						video		: videoSource,
						photo		: user.data[i].picture,
						object_id	: user.data[i].object_id,
						create_date : createTime.toDateString(),
						likes		: typeof(user.data[i].likes)!='undefined'?user.data[i].likes.data.length:0,
						comments	: typeof(user.data[i].comments)!='undefined'?user.data[i].comments.data.length:0,
						commentLink : commentLink,
						likeLink	: likeLink
					});

				}
				totalLoaded++;
				nextLink = user.paging.next;
				prevLink = user.paging.previous;
				readyForLoad = false;
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		}else{
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}
		
	};

	$ionicModal.fromTemplateUrl('post-comment.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
  
	$scope.showCommentBox = function($event){
		$scope.modal.show();
		$event.preventDefault();
	};
	
	$scope.closeCommentBox = function($event){
		$scope.modal.hide();
	};
	
	var loadNewPost = setInterval(function(){
		var topPos = $ionicScrollDelegate.getScrollPosition().top;
		
		if( latestTimeStamp > 0 ){
			openFB.api({
				// path: '/Syntacticsinc/feed',
				path: '/'+localStorage.quotify_user_id+'/home',
				// path: '/435909393097227/feed',
				params: { since: latestTimeStamp },
				success: function(feed) {
					console.log(feed);
				}
			});
		}
	},30000);
	
	
	
	$scope.openSideMenu = function(){
		$ionicSideMenuDelegate.toggleLeft(); 
	};
	
	
	$scope.logout = function(){
		$ionicLoading.show({
			template: '<ion-spinner icon="android"></ion-spinner> Logging Out...'
		});
		openFB.logout(
			function() {
				$state.go('login');
				$ionicLoading.hide();
			},
			function(){
				alert('Failed');
			});
	};  
	
	$scope.showLikeBox = function($event){ 
		
		$event.preventDefault();
	};
	
	$scope.share = function(event) {  
			
		//http://www.facebook.com/sharer.php?s=100&p[title]=YOUR_TITLE&p[summary]=YOUR_SUMMARY&p[url]=YOUR_URL&p[images][0]=YOUR_IMAGE_TO_SHARE_OBJECT"
		
		console.log(event);  
			
		/* openFB.api({
			method: 'post',
			path: '/me/feed',
			params: { 
				message:  event.content
			},
			success: function () {
				alert('The session was shared on Facebook');
			},
			error: function () {
				alert('An error occurred while sharing this session on Facebook');
			}
		});  */
		
		
		
		
	};
	
	$scope.postComment = function(){
		console.log('asdasd');
	};
	
	
})

.controller('SettingsCtrl', function($scope,$ionicLoading,$state) {
	
	$scope.logout = function(){
		$ionicLoading.show({
			template: '<ion-spinner icon="android"></ion-spinner> Logging Out...'
		});
		openFB.logout(
			function() {
				
				$ionicLoading.hide();
			},
			function(){
				alert('Failed');
			});
	};  
	
	$scope.back = function(){
		$state.go('tab.dash'); 
	}
	
	
	
})
.controller('ComposeCtrl', function($scope,$state) {

	$scope.takePhoto = function(){
		
		navigator.camera.getPicture(function(imageURI) {

			// imageURI is the URL of the image that we can use for
			// an <img> element or backgroundImage.
			
			$scope.postPhoto = imageURI;
			
			$scope.showPic = true;
			
			$scope.$apply();
			// alert(imageURI);

		  }, function(err) {

			// Ruh-roh, something bad happened
			
			// alert(err);

		});
	};
	
	$scope.postComment = function(){
		console.log('asdasd');
	};
	
	$scope.back = function(){
		$state.go('tab.dash'); 
	}

})
 

.controller('LoginCtrl', function($scope, $state, $ionicPopup) {

	$scope.fbLogin = function() {
		openFB.login(
			function(response) {
				if (response.status === 'connected') {
					openFB.api({
						path: '/me',
						success: function(me){
							localStorage.quotify_user_id = me.id;
							localStorage.quotify_email = me.email;
							var alertPopup = $ionicPopup.alert({
								title: 'Welcome '+me.first_name+' '+me.last_name,
								buttons: [
									{
										text: 'OK',
										type: 'button-assertive',
										onTap: function(e){
											$state.go('tab.dash');
										}
									}
								]
							});
						},
						error: function(){
							alert('Failed to get account information');
						}
					});
					
				} else {
					alert('Facebook login failed');
				}
			},
			{scope: 'email,read_stream,publish_stream,publish_actions,user_groups'});
	}

	// var registeredUsers = { wewew:'testtest', test:'test123'} ;
	
	// $scope.login = {
		// submit: function(){
		
			// if( registeredUsers.hasOwnProperty($scope.login.name) ){
				// if( registeredUsers[$scope.login.name] == $scope.login.pass ){
					// var alertPopup = $ionicPopup.alert({
						// type: 'button-positive',
						// title: 'Successfully Logged In'
					// });
					// alertPopup.then(function(res) {
						// $state.go('tab.dash', {user: $scope.login.name});
					// });
				// }else{
					// var alertPopup = $ionicPopup.alert({
						// title: 'Invalid Password'
					// });
				// }
			// }else{
				// var alertPopup = $ionicPopup.alert({
					// title: 'Invalid Username'
				// });
			// }
		// }
	// };

})
.controller('OfflineCtrl', function($scope,$ionicPlatform) {

	$ionicPlatform.registerBackButtonAction(function (event) {
			event.preventDefault();
	}, 100);
	
	$scope.retryConnection = function(){ 
		if(window.Connection) {
			console.log(Connection);
			if( navigator.connection.type != Connection.NONE && navigator.connection.type != Connection.UNKNOWN ) {
				$state.go('login');
			}
		}
	};

})  
.controller('QuoteCtrl', function($scope) { 
	
}) 