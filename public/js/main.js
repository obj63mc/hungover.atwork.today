var atworktoday = angular.module('atworktoday', ['ngSanitize']);

atworktoday.controller('main', ['$scope', '$http', '$sce',
    function($scope, $http, $sce){

        $scope.posts = [];
        var d = new Date().getDate();

        $scope.trustSrc = function(src) {
    	    return $sce.trustAsResourceUrl(src);
    	}

        $scope.ga = function(type, action, label){
            ga('send','event', type, action, label);
        };

        $http.get('http://atworktoday.postpogo.com/Feed/feedstart?type=all&approved=0&limit=100000').success(function(response){

            for(var i in response.posts){
                if(new Date(response.posts[i].postdate).getDate() == d){
                    $scope.posts.push(response.posts[i]);
                }
            }
        });

        var socket = io.connect('http://atworktoday.postpogo.com:80');

        socket.on('connect', function(){
            socket.on('newpost', function(response){
                $scope.posts.unshift(response.post);
                $scope.$apply();
            });
        });
    }
]);
