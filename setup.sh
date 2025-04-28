#!/bin/bash

# 설정 파일을 시스템에 복사
sudo cp ./rc-local.service /etc/systemd/system/rc-local.service
sudo cp ./rc.local /etc/rc.local

# 서비스 등록
sudo systemctl daemon-reload
sudo systemctl enable rc-local
sudo systemctl start rc-local
