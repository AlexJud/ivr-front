pipeline {
    agent {
        docker {
            image 'node:10.17.0-jessie'
            args '-u 0:0'
        }
    }
    stages {
        stage('Build') { 
            steps {
                sh 'tail -f /dev/null' 
            }
        }
    }
}