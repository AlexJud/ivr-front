pipeline {
    agent {
        docker {
            image 'node:12.13.1-stretch'
            args '-u 0:0'
        }
    }
    stages {
        stage('Git') { 
            steps {
                sh 'apt install git' 
            }
        }
        stage('Build') { 
            steps {
                sh 'yarn install' 
            }
        }
    }
}