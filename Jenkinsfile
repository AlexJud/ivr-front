pipeline {
    agent {
        docker {
            image 'node:10.17.0-jessie'
            args '-p 3000:3000' 
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