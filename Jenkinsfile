pipeline {
    agent {
        dockerfile {
            filename 'infra/docker/ci-agent/Dockerfile'
            dir '.'
            reuseNode true
            args '-v /var/run/docker.sock:/var/run/docker.sock -u root:root --network touring-club'
        }
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '25'))
    }

    environment {
        CI = 'true'
        NX_NO_CLOUD = 'true'
        NODE_ENV = 'test'
        HOST = '0.0.0.0'
        AUTH_SERVICE_PORT = '3000'
        PORT = '3000'
        BETTER_AUTH_SECRET = credentials('touring-club-better-auth-secret')
        DATABASE_URL = credentials('touring-club-database-url')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'bun install --frozen-lockfile'
            }
        }

        stage('Resolve Nx base') {
            steps {
                script {
                    def targetBranch = env.CHANGE_TARGET ?: 'main'
                    env.NX_BASE = "origin/${targetBranch}"

                    sh "git fetch origin ${targetBranch} --depth=1 || true"

                    def baseExists = sh(
                        script: "git rev-parse --verify ${env.NX_BASE}^{commit}",
                        returnStatus: true,
                    ) == 0

                    env.NX_USE_AFFECTED = baseExists ? 'true' : 'false'
                }
            }
        }

        stage('Lint') {
            steps {
                script {
                    runNx('lint')
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    runNx('test')
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    runNx('build')
                }
            }
        }

        stage('E2E') {
            when {
                expression {
                    shouldRunE2e()
                }
            }
            steps {
                sh 'bun run migration:run'
                sh 'bun nx run auth-service-e2e:e2e --nxBail'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'CD hook: publish auth-service artifacts and deploy to your target environment.'
                echo 'Extend this stage with docker push, kubectl apply, or your deployment tool of choice.'
            }
        }
    }

    post {
        always {
            cleanWs(deleteDirs: true, disableDeferredWipeout: true)
        }
    }
}

def runNx(String target) {
  if (env.NX_USE_AFFECTED == 'true') {
    sh "bun nx affected -t ${target} --base=${env.NX_BASE} --head=HEAD --nxBail"
  } else {
    sh "bun nx run-many -t ${target} --nxBail"
  }
}

def shouldRunE2e() {
  if (env.NX_USE_AFFECTED != 'true') {
    return true
  }

  def affected = sh(
    script: "bun nx show projects --affected --base=${env.NX_BASE} --head=HEAD --plain",
    returnStdout: true,
  ).trim()

  if (!affected) {
    return false
  }

  return affected.split('\n').any { project ->
    project == 'auth-service' || project == 'auth-service-e2e'
  }
}
