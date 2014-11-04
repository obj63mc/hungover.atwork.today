var atworktoday = angular.module('atworktoday', ['ngSanitize']);

atworktoday.controller('main', ['$scope', '$http', '$sce',
    function($scope, $http, $sce){

        $scope.posts = [];
        var d = new Date().getDate();

        $scope.trustSrc = function(src) {
    	    return $sce.trustAsResourceUrl(src);
    	}

        var socket = io.connect('http://atworktoday.postpogo.com:80');

        socket.on('connect', function(){
            socket.get('/Feed/feedstart?type=all&approved=0&limit=100000', function(response){

                for(var i in response.posts){
                    if(new Date(response.posts[i].postdate).getDate() == d){
                        $scope.posts.push(response.posts[i]);
                    }
                }
                $scope.posts = response.posts;
                $scope.$apply();
            });

            socket.on('newpost', function(response){                
                $scope.posts.unshift(response.post);
                $scope.$apply();
            });
        })
    }
]);
