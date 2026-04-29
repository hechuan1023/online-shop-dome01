# -*- coding: utf-8 -*-
"""
BZShop 一键部署脚本
功能：SSH 连接服务器 → Git 拉取代码 → 安装依赖 → 重启服务
"""

import paramiko
import sys
import os
from datetime import datetime

# ==================== 服务器配置 ====================
SERVER = {
    "host": "118.31.108.147",
    "port": 22,
    "user": "root",
    "password": "Dh1284949667",
    "remote_dir": "/root/shop-server",
    "pm2_name": "shop-server",
}

# ==================== 颜色输出 ====================
def green(msg):
    print(f"\033[32m{msg}\033[0m")

def red(msg):
    print(f"\033[31m{msg}\033[0m")

def yellow(msg):
    print(f"\033[33m{msg}\033[0m")

def blue(msg):
    print(f"\033[36m{msg}\033[0m")

# ==================== 核心逻辑 ====================
class Deployer:
    def __init__(self, config):
        self.config = config
        self.ssh = None
        self.sftp = None

    def connect(self):
        blue(f"[1/5] 连接服务器 {self.config['host']} ...")
        self.ssh = paramiko.SSHClient()
        self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.ssh.connect(
            self.config["host"],
            self.config["port"],
            self.config["user"],
            self.config["password"],
        )
        self.sftp = self.ssh.open_sftp()
        green("  -> 连接成功")

    def exec(self, cmd):
        """执行远程命令并返回 stdout/stderr"""
        stdin, stdout, stderr = self.ssh.exec_command(cmd)
        out = stdout.read().decode("utf-8", errors="replace").strip()
        err = stderr.read().decode("utf-8", errors="replace").strip()
        return out, err

    def git_pull(self):
        blue(f"[2/5] Git 拉取代码 ...")
        cmd = f"cd {self.config['remote_dir']} && git pull 2>&1"
        out, err = self.exec(cmd)
        print(f"  {out}")
        if err and "error" in err.lower():
            yellow(f"  [警告] {err}")

    def install_deps(self):
        blue(f"[3/5] 检查并安装依赖 ...")
        cmd = f"cd {self.config['remote_dir']} && npm install --production 2>&1"
        out, err = self.exec(cmd)
        if out:
            # 只打印关键信息
            for line in out.split("\n"):
                if "added" in line or "removed" in line or "updated" in line or "up to date" in line:
                    print(f"  {line.strip()}")
        if "ERR" in err:
            yellow(f"  [警告] {err}")

    def restart_service(self):
        blue(f"[4/5] 重启服务 ...")
        cmd = f"pm2 restart {self.config['pm2_name']} 2>&1"
        out, err = self.exec(cmd)
        if out:
            print(f"  {out}")
        if err:
            yellow(f"  [警告] {err}")

    def check_status(self):
        blue(f"[5/5] 检查服务状态 ...")
        cmd = f"pm2 show {self.config['pm2_name']} 2>&1"
        out, err = self.exec(cmd)
        # 提取关键状态行
        for line in out.split("\n"):
            line = line.strip()
            if any(kw in line for kw in ["status", "cpu", "mem", "uptime", "restarts", "pid"]):
                print(f"  {line}")
        if "online" in out.lower():
            green("  -> 服务运行正常")
        else:
            red("  -> 服务状态异常，请检查！")

    def upload_file(self, local_path, remote_path):
        """上传单个文件"""
        self.sftp.put(local_path, remote_path)

    def close(self):
        if self.sftp:
            self.sftp.close()
        if self.ssh:
            self.ssh.close()


def deploy_full(deployer):
    """完整部署流程：Git 拉取 → 安装依赖 → 重启 → 检查"""
    deployer.git_pull()
    deployer.install_deps()
    deployer.restart_service()
    deployer.check_status()


def deploy_files(deployer, files):
    """指定文件部署：上传文件 → 重启 → 检查"""
    blue(f"[2/5] 上传 {len(files)} 个文件 ...")
    for f in files:
        local = os.path.join(os.path.dirname(__file__), f)
        remote = deployer.config["remote_dir"] + "/" + f.replace("\\", "/")
        deployer.upload_file(local, remote)
        print(f"  {f} -> {remote}")
    deployer.restart_service()
    deployer.check_status()


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "full"

    print()
    blue("=" * 60)
    blue(f"  BZShop 一键部署")
    blue(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    blue("=" * 60)

    deployer = Deployer(SERVER)

    try:
        deployer.connect()

        if mode == "full":
            deploy_full(deployer)
        elif mode == "files":
            files = sys.argv[2:]
            if not files:
                red("请指定要上传的文件路径，例如：python deploy.py files pages/index/index.js")
                sys.exit(1)
            deploy_files(deployer, files)
        elif mode == "restart":
            deployer.restart_service()
            deployer.check_status()
        elif mode == "status":
            deployer.check_status()
        else:
            print(f"用法：python deploy.py [full|files <文件列表>|restart|status]")
            sys.exit(1)

        green("部署完成！")

    except Exception as e:
        red(f"部署失败: {e}")
        sys.exit(1)
    finally:
        deployer.close()


if __name__ == "__main__":
    main()
