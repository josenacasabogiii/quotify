angular.module('qoutify.services', [])

.factory('DashFlow',function(){
	
	
	return {
		add: function(){
			
		}
	};
})

.factory('SettingsFlow',function(){
	
	
	
})

.factory('PopupNotifications',function(){
	
	// var alertPopup = $ionicPopup.alert({
						// title: 'Successfully Logged In',
						// buttons: [
							// {
								// text: 'OK',
								// type: 'button-assertive',
								// onTap: function(e){
									// $state.go('tab.dash');
								// }
							// }
						// ]
					// });
	
		return {
			pop : function( text ){
				$ionicPopup.alert({
					title: text,
					buttons: [
						{
							text: 'OK',
							type: 'button-assertive',
							onTap: function(e){
								// $state.go('tab.dash');
							}
						}
					]
				});
			}
		}
	
});
