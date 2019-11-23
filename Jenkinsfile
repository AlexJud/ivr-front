pipeline {
    agent {
        docker {
            image 'node:12.13.1-stretch'
            args '-u 0:0'
        }
    }
    stages {
        stage('Build') { 
            steps {
                sh 'apk add git' 
            }
        }
        stage('Build') { 
            steps {
                sh 'yarn install' 
            }
        }
    }
}